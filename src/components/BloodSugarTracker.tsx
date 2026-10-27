import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { ReactNode } from 'react';
import type { BloodSugarEntry, GlucoseUnit, MealContext, Medication, Profile, Subscription, WeightEntry } from '../types';
import { toDisplayUnit, toMgdl, unitLabel } from '../types';
import { LimitBar, PremiumGate } from './PremiumGate';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { contextLabel, getGlucoseStatus, newId, normalRangeText, thresholdsFor } from '../utils/health';
import { TrackerStats } from './TrackerStats';
import { WeightTracker } from './WeightTracker';

interface Props {
  entries: BloodSugarEntry[];
  weightEntries: WeightEntry[];
  medications: Medication[];
  medicationPanel: ReactNode;
  unit: GlucoseUnit;
  profile: Profile;
  heightCm: number | null;
  subscription: Subscription;
  onAdd: (entry: BloodSugarEntry) => void;
  onDelete: (id: string) => void;
  onAddWeight: (entry: WeightEntry) => void;
  onDeleteWeight: (id: string) => void;
  onUnitChange: (unit: GlucoseUnit) => void;
  onHeightChange: (cm: number | null) => void;
  onUpgrade: () => void;
}

const CONTEXTS: { value: MealContext; description: string }[] = [
  { value: 'fasting', description: 'Morgens vor dem Frühstück' },
  { value: 'before_meal', description: 'Kurz vor dem Essen' },
  { value: 'after_meal_1h', description: '1 h nach dem Essen' },
  { value: 'after_meal', description: '2 h nach dem Essen' },
  { value: 'bedtime', description: 'Abends vor dem Schlafen' },
];

// Der 1-h-Wert ist nur im Schwangerschafts-Modus ein eigener Zielwert
const contextsFor = (profile: Profile) =>
  CONTEXTS.filter((c) => profile === 'pregnancy' || c.value !== 'after_meal_1h');

type View = 'list' | 'chart' | 'stats' | 'weight' | 'meds';

// Schnelleres Eintragen: Messzeitpunkt anhand der Uhrzeit vorschlagen
function suggestContext(): BloodSugarEntry['mealContext'] {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'fasting';
  if (h >= 10 && h < 12) return 'before_meal';
  if (h >= 12 && h < 15) return 'after_meal';
  if (h >= 17 && h < 20) return 'after_meal';
  if (h >= 21 || h < 5) return 'bedtime';
  return 'before_meal';
}

const AVAILABLE_TAGS = ['Sport', 'Stress', 'Krank', 'Unterwegs', 'Wenig Schlaf'];
const MOODS = [
  { value: 'good', emoji: '😊', label: 'Gut' },
  { value: 'neutral', emoji: '😐', label: 'Okay' },
  { value: 'bad', emoji: '😞', label: 'Schlecht' },
] as const;

export function BloodSugarTracker({
  entries, weightEntries, medications, medicationPanel, unit, profile, heightCm, subscription,
  onAdd, onDelete, onAddWeight, onDeleteWeight, onUnitChange, onHeightChange, onUpgrade,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [value, setValue] = useState('');
  const [context, setContext] = useState<BloodSugarEntry['mealContext']>(suggestContext());
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [carbs, setCarbs] = useState('');
  const [mood, setMood] = useState<BloodSugarEntry['mood']>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<View>('list');

  const { isPremium, maxEntries, canViewChart } = usePlanFeatures(subscription);
  const contexts = contextsFor(profile);
  const getStatus = (mgdl: number, ctx: string) => getGlucoseStatus(mgdl, ctx, profile);
  const isAtLimit = entries.length >= maxEntries;

  const parseInput = (raw: string): number | null => {
    const num = parseFloat(raw.replace(',', '.'));
    if (isNaN(num)) return null;
    const mgdl = toMgdl(num, unit);
    if (mgdl < 30 || mgdl > 600) return null;
    return mgdl;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAtLimit) return;
    const mgdl = parseInput(value);
    if (mgdl === null) return;
    const carbsNum = carbs ? parseInt(carbs) : undefined;
    onAdd({
      id: newId(),
      value: mgdl,
      timestamp: new Date().toISOString(),
      mealContext: context,
      notes: notes || undefined,
      carbs: carbsNum !== undefined && carbsNum >= 0 && carbsNum <= 500 ? carbsNum : undefined,
      mood,
      tags: tags.length > 0 ? tags : undefined,
    });
    setValue('');
    setNotes('');
    setCarbs('');
    setMood(undefined);
    setTags([]);
    setShowDetails(false);
    setContext(suggestContext());
    setShowForm(false);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const chartData = [...entries]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-14)
    .map((e) => ({
      date: new Date(e.timestamp).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }),
      value: toDisplayUnit(e.value, unit),
    }));

  const previewMgdl = value ? parseInput(value) : null;

  const refLine = (mgdl: number) => toDisplayUnit(mgdl, unit);
  const th = thresholdsFor(profile);
  const refWarn = profile === 'pregnancy' ? th.fasting.warning : th.fasting.danger;
  const refDanger = profile === 'pregnancy' ? th.after_meal_1h.warning : th.after_meal.danger;
  const yDomain: [number, number] = unit === 'mmoll' ? [3, profile === 'pregnancy' ? 12 : 17] : [60, profile === 'pregnancy' ? 220 : 300];

  const views: { id: View; label: string; premium?: boolean }[] = [
    { id: 'list', label: '📝 Liste' },
    { id: 'chart', label: '📈 Verlauf', premium: !canViewChart },
    { id: 'stats', label: '📊 Statistik' },
    { id: 'weight', label: '⚖️ Gewicht' },
    { id: 'meds', label: '💊 Medis' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blutzucker-Tracker</h2>
          <p className="text-sm text-gray-500">Messen, protokollieren, verstehen</p>
        </div>
        {!isAtLimit ? (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
            + Messen
          </button>
        ) : (
          <button onClick={onUpgrade} className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold py-2 px-4 rounded-xl">
            👑 Upgrade
          </button>
        )}
      </div>

      {/* Einheiten-Umschaltung */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-2.5">
        <span className="text-xs text-gray-500 font-medium">Maßeinheit</span>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(['mgdl', 'mmoll'] as GlucoseUnit[]).map((u) => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                unit === u ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              {unitLabel(u)}
            </button>
          ))}
        </div>
      </div>

      {/* Eintrags-Limit für Free-Nutzer */}
      {!isPremium && (
        <LimitBar
          current={entries.length}
          max={maxEntries}
          label="Einträge (kostenlos)"
          onUpgrade={onUpgrade}
        />
      )}

      {/* Eingabeformular */}
      {showForm && !isAtLimit && (
        <div className="card border-2 border-green-200">
          <h3 className="font-semibold text-gray-900 mb-4">Neuen Wert eintragen</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Messzeitpunkt
              </label>
              <div className="grid grid-cols-2 gap-2">
                {contexts.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setContext(opt.value)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      context === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-800">{contextLabel(opt.value, profile)}</p>
                    <p className="text-xs text-gray-400">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blutzucker-Wert ({unitLabel(unit)})
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={unit === 'mmoll' ? 'z.B. 5,3' : 'z.B. 95'}
                  className="input-field"
                  required
                />
                <div className="flex items-center justify-center w-20 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium">
                  {unitLabel(unit)}
                </div>
              </div>
              {previewMgdl !== null && (
                <div className={`mt-2 text-xs font-medium px-3 py-1 rounded-full inline-block ${getStatus(previewMgdl, context).bg} ${getStatus(previewMgdl, context).color}`}>
                  {getStatus(previewMgdl, context).label} · Normal: {normalRangeText(context, profile, unit)}
                </div>
              )}
            </div>

            {/* Optionale Details – bewusst eingeklappt, damit das Eintragen schnell bleibt */}
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-left text-xs font-semibold text-gray-500 flex items-center gap-1.5 py-1"
            >
              <span className={`transition-transform ${showDetails ? 'rotate-90' : ''}`}>▶</span>
              Mehr Details (optional) – KH, Stimmung, Tags
            </button>

            {showDetails && (
              <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    🍞 Kohlenhydrate der Mahlzeit (g)
                  </label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="z.B. 45"
                    min="0"
                    max="500"
                    className="input-field !py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Wie fühlen Sie sich?
                  </label>
                  <div className="flex gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMood(mood === m.value ? undefined : m.value)}
                        className={`flex-1 py-2 rounded-xl border-2 text-center transition-all ${
                          mood === m.value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="text-xl block">{m.emoji}</span>
                        <span className="text-xs text-gray-500">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          tags.includes(tag)
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Notizen
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="z.B. Pizza beim Italiener..."
                    className="input-field !py-2"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Speichern</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {/* Ansichts-Umschaltung */}
      <div className="grid grid-cols-5 gap-1.5">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`py-2 px-1 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
              activeView === v.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {v.label} {v.premium && <span>👑</span>}
          </button>
        ))}
      </div>

      {activeView === 'stats' && (
        <TrackerStats
          entries={entries}
          weightEntries={weightEntries}
          medications={medications}
          unit={unit}
          profile={profile}
          subscription={subscription}
          onUpgrade={onUpgrade}
        />
      )}

      {activeView === 'meds' && medicationPanel}

      {activeView === 'weight' && (
        <WeightTracker
          entries={weightEntries}
          heightCm={heightCm}
          onAdd={onAddWeight}
          onDelete={onDeleteWeight}
          onHeightChange={onHeightChange}
        />
      )}

      {activeView === 'chart' && entries.length > 0 && (
        canViewChart ? (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Blutzucker-Verlauf (letzte 14 Einträge)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#98a2b3' }} axisLine={false} tickLine={false} />
                <YAxis domain={yDomain} tick={{ fontSize: 11, fill: '#98a2b3' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} ${unitLabel(unit)}`, 'Blutzucker']}
                  cursor={{ stroke: '#d0d5dd', strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 12, border: '1px solid #eaecf0', fontSize: 12,
                    boxShadow: '0 8px 24px rgba(16,24,40,0.12)', padding: '8px 12px',
                  }}
                />
                <ReferenceLine y={refLine(refWarn)} stroke="#f79009" strokeDasharray="4 4" label={{ value: profile === 'pregnancy' ? 'Nüchtern-Ziel' : 'Grenze', fontSize: 10, fill: '#b54708', position: 'insideTopRight' }} />
                <ReferenceLine y={refLine(refDanger)} stroke="#f04438" strokeDasharray="4 4" label={{ value: profile === 'pregnancy' ? '1-h-Ziel' : 'Zu hoch', fontSize: 10, fill: '#b42318', position: 'insideTopRight' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <PremiumGate
            feature="Verlaufsdiagramm"
            description="Sehen Sie Ihren Blutzuckerverlauf über Zeit – nur in Premium."
            onUpgrade={onUpgrade}
          />
        )
      )}

      {activeView === 'chart' && entries.length === 0 && (
        <div className="card text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">📈</p>
          <p className="text-sm">Noch keine Daten für ein Diagramm.</p>
        </div>
      )}

      {activeView === 'list' && (
        <>
          {/* Referenzwerte */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">📋 Referenzwerte {profile === 'pregnancy' && <span className="ml-1 text-xs font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">🤰 Schwangerschaft</span>}</h3>
            <div className="grid grid-cols-2 gap-2">
              {contexts.map((opt) => (
                <div key={opt.value} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700">{contextLabel(opt.value, profile)}</p>
                  <p className="text-xs text-gray-500">{opt.description}</p>
                  <p className="text-xs font-bold text-green-600 mt-1">{normalRangeText(opt.value, profile, unit)}</p>
                </div>
              ))}
            </div>
          </div>

          {entries.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Alle Messungen</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...entries].reverse().map((entry) => {
                  const status = getStatus(entry.value, entry.mealContext);
                  const ctxLabel = contextLabel(entry.mealContext, profile);
                  return (
                    <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-400">{ctxLabel}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(entry.timestamp).toLocaleString('de-DE', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                        {(entry.carbs !== undefined || entry.mood || (entry.tags && entry.tags.length > 0)) && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            {entry.carbs !== undefined && (
                              <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md">🍞 {entry.carbs}g KH</span>
                            )}
                            {entry.mood && (
                              <span className="text-xs">{entry.mood === 'good' ? '😊' : entry.mood === 'neutral' ? '😐' : '😞'}</span>
                            )}
                            {entry.tags?.map((tag) => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">{tag}</span>
                            ))}
                          </div>
                        )}
                        {entry.notes && <p className="text-xs text-gray-500 italic mt-0.5">"{entry.notes}"</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-gray-900">{String(toDisplayUnit(entry.value, unit)).replace('.', ',')}</p>
                        <p className="text-xs text-gray-400">{unitLabel(unit)}</p>
                        <button
                          onClick={() => onDelete(entry.id)}
                          aria-label="Messung löschen"
                          className="text-gray-300 hover:text-red-400 transition-colors text-sm px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {entries.length === 0 && !showForm && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Noch keine Messungen</h3>
              <p className="text-sm text-gray-400 mb-4">Tragen Sie Ihren ersten Blutzuckerwert ein</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                Erste Messung eintragen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
