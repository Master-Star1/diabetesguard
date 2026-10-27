import { getDailyTip } from '../data/nutritionTips';
import type { BloodSugarEntry, GlucoseUnit, Profile, RiskAssessmentResult, ActiveTab, Subscription, WeightEntry } from '../types';
import { toDisplayUnit, unitLabel } from '../types';

import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { GamificationCard, ChallengesCard } from './GamificationCard';
import { contextLabel, getGlucoseStatus, pregnancyWeek } from '../utils/health';

interface Props {
  bloodSugarEntries: BloodSugarEntry[];
  weightEntries: WeightEntry[];
  unit: GlucoseUnit;
  profile: Profile;
  dueDate: string | null;
  lastAssessment: RiskAssessmentResult | null;
  subscription: Subscription;
  onNavigate: (tab: ActiveTab) => void;
  onUpgrade: () => void;
}

const categoryLabels = {
  food: 'Ernährung',
  lifestyle: 'Lebensstil',
  monitoring: 'Kontrolle',
  exercise: 'Bewegung',
};

function getRiskColor(level: string) {
  switch (level) {
    case 'low': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Niedriges Risiko', border: 'border-green-200' };
    case 'moderate': return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Mittleres Risiko', border: 'border-yellow-200' };
    case 'high': return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Erhöhtes Risiko', border: 'border-orange-200' };
    case 'very_high': return { bg: 'bg-red-100', text: 'text-red-700', label: 'Hohes Risiko', border: 'border-red-200' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Nicht bewertet', border: 'border-gray-200' };
  }
}

export function Dashboard({ bloodSugarEntries, weightEntries, unit, profile, dueDate, lastAssessment, subscription, onNavigate, onUpgrade }: Props) {
  const { isPremium, maxEntries } = usePlanFeatures(subscription);
  const getBloodSugarStatus = (v: number, c: string) => getGlucoseStatus(v, c, profile);
  const ssw = pregnancyWeek(dueDate);
  const dailyTip = getDailyTip(profile);
  const recentEntries = bloodSugarEntries.slice(-5).reverse();
  const lastEntry = bloodSugarEntries[bloodSugarEntries.length - 1];
  const lastWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;
  const avgBloodSugar = bloodSugarEntries.length > 0
    ? Math.round(bloodSugarEntries.reduce((sum, e) => sum + e.value, 0) / bloodSugarEntries.length)
    : null;
  const fmt = (mgdl: number) => String(toDisplayUnit(mgdl, unit)).replace('.', ',');

  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{today}</p>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">Guten Tag! 👋</h2>
        <p className="text-gray-400 text-sm mt-1">Hier ist Ihre persönliche Gesundheitsübersicht</p>
      </div>

      {/* Schwangerschafts-Banner */}
      {profile === 'pregnancy' && (
        <button
          onClick={() => onNavigate('nutrition')}
          className="w-full text-left bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-pink-500/25"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🤰</span>
            <div className="flex-1">
              <p className="font-bold">Schwangerschaftsdiabetes-Modus</p>
              <p className="text-xs text-pink-100 mt-0.5">
                {ssw
                  ? `SSW ${ssw.week}+${ssw.day} · noch ${ssw.daysLeft} Tage bis zum Termin`
                  : 'Zielwerte: nüchtern < 95 · 1 h < 140 · 2 h < 120 mg/dL'}
              </p>
            </div>
            <span className="text-white/80">→</span>
          </div>
        </button>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Letzter Blutzucker</span>
            <span className="text-xl">🩸</span>
          </div>
          {lastEntry ? (
            <>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">{fmt(lastEntry.value)} <span className="text-sm font-normal text-gray-500">{unitLabel(unit)}</span></p>
              <p className={`text-xs font-medium mt-1 ${getBloodSugarStatus(lastEntry.value, lastEntry.mealContext).color}`}>
                {getBloodSugarStatus(lastEntry.value, lastEntry.mealContext).label}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-400">Kein Eintrag</p>
              <button onClick={() => onNavigate('tracker')} className="text-xs text-green-600 mt-1 hover:underline">Jetzt messen →</button>
            </>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ø Blutzucker</span>
            <span className="text-xl">📊</span>
          </div>
          {avgBloodSugar ? (
            <>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">{fmt(avgBloodSugar)} <span className="text-sm font-normal text-gray-500">{unitLabel(unit)}</span></p>
              <p className="text-xs text-gray-500 mt-1">aus {bloodSugarEntries.length} Messungen</p>
            </>
          ) : (
            <p className="text-lg font-semibold text-gray-400">Noch keine Daten</p>
          )}
        </div>

        <div
          className={`card cursor-pointer hover:shadow-md transition-shadow border ${lastAssessment ? getRiskColor(lastAssessment.level).border : 'border-gray-100'}`}
          onClick={() => onNavigate('assessment')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Risiko-Score</span>
            <span className="text-xl">🔍</span>
          </div>
          {lastAssessment ? (
            <>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">{lastAssessment.percentage}%</p>
              <p className={`text-xs font-medium mt-1 ${getRiskColor(lastAssessment.level).text}`}>
                {getRiskColor(lastAssessment.level).label}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-400">Test ausstehend</p>
              <p className="text-xs text-green-600 mt-1">Jetzt starten →</p>
            </>
          )}
        </div>

        <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('tracker')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Gewicht</span>
            <span className="text-xl">⚖️</span>
          </div>
          {lastWeight ? (
            <>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">{String(lastWeight.weight).replace('.', ',')} <span className="text-sm font-normal text-gray-500">kg</span></p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(lastWeight.timestamp).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-400">Kein Eintrag</p>
              <p className="text-xs text-green-600 mt-1">Jetzt wiegen →</p>
            </>
          )}
        </div>
      </div>

      {/* Gamification: Zucki + Streak + Level */}
      <GamificationCard entries={bloodSugarEntries} weightEntries={weightEntries} />

      {/* Daily Tip */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-green-600/25">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-white/20`}>
            {categoryLabels[dailyTip.category]}
          </span>
          <span className="text-xs text-green-100">Tipp des Tages</span>
        </div>
        <div className="flex gap-4">
          <span className="text-4xl">{dailyTip.icon}</span>
          <div>
            <h3 className="font-bold text-lg leading-tight mb-1">{dailyTip.title}</h3>
            <p className="text-green-100 text-sm leading-relaxed">{dailyTip.content}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('nutrition')}
          className="mt-4 text-xs text-white/80 hover:text-white flex items-center gap-1"
        >
          Alle Ernährungstipps ansehen →
        </button>
      </div>

      {/* Recent Blood Sugar */}
      {recentEntries.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Letzte Messungen</h3>
            <button onClick={() => onNavigate('tracker')} className="text-xs text-green-600 hover:underline">
              Alle anzeigen →
            </button>
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry) => {
              const status = getBloodSugarStatus(entry.value, entry.mealContext);
              return (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contextLabel(entry.mealContext, profile)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{fmt(entry.value)} {unitLabel(unit)}</p>
                    <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wochen-Challenges */}
      <ChallengesCard entries={bloodSugarEntries} weightEntries={weightEntries} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('assessment')}
          className="card flex flex-col items-center gap-2 hover:shadow-md transition-shadow cursor-pointer text-center py-4"
        >
          <span className="text-3xl">🔍</span>
          <span className="text-sm font-medium text-gray-700">Diabetes-Risikotest</span>
          <span className="text-xs text-gray-400">12 Fragen, 3 Minuten</span>
        </button>
        <button
          onClick={() => onNavigate('foods')}
          className="card flex flex-col items-center gap-2 hover:shadow-md transition-shadow cursor-pointer text-center py-4"
        >
          <span className="text-3xl">🛒</span>
          <span className="text-sm font-medium text-gray-700">Lebensmittelführer</span>
          <span className="text-xs text-gray-400">Was gut für Sie ist</span>
        </button>
      </div>

      {/* Premium upsell banner for free users */}
      {!isPremium && (
        <button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 hover:brightness-105 active:scale-[0.99] rounded-2xl p-5 text-left transition-all shadow-lg shadow-orange-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-base">👑 Premium freischalten</p>
              <p className="text-white/80 text-xs mt-0.5">
                Noch {maxEntries - bloodSugarEntries.length} kostenlose Einträge · Diagramm, PDF-Export &amp; mehr
              </p>
            </div>
            <span className="text-white text-2xl">→</span>
          </div>
        </button>
      )}
    </div>
  );
}
