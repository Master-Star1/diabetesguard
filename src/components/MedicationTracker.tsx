import { useState } from 'react';
import type { MedIntake, Medication } from '../types';
import { localDay, newId } from '../utils/health';
import type { PermissionState } from '../utils/notifications';

interface Props {
  medications: Medication[];
  intakes: MedIntake[];
  permission: PermissionState;
  onAdd: (med: Medication) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onLogIntake: (intake: MedIntake) => void;
  onUndoIntake: (id: string) => void;
  onRequestPermission: () => void;
}

const PRESET_TIMES = ['07:00', '08:00', '12:00', '18:00', '20:00', '22:00'];

export function MedicationTracker({
  medications, intakes, permission,
  onAdd, onDelete, onToggleActive, onLogIntake, onUndoIntake, onRequestPermission,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [customTime, setCustomTime] = useState('');

  const today = localDay();
  const active = medications.filter((m) => m.active);

  // Tagesplan: jedes aktive Medikament × jede Uhrzeit
  const schedule = active
    .flatMap((m) => m.times.map((time) => ({ med: m, time })))
    .sort((a, b) => a.time.localeCompare(b.time));

  const intakeFor = (medId: string, time: string) =>
    intakes.find((i) => i.medicationId === medId && i.date === today && i.time === time);

  const takenToday = schedule.filter((s) => intakeFor(s.med.id, s.time)?.status === 'taken').length;

  // Einnahmetreue der letzten 7 Tage
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recent = intakes.filter((i) => new Date(i.timestamp) >= weekAgo);
  const adherence = recent.length > 0
    ? Math.round((recent.filter((i) => i.status === 'taken').length / recent.length) * 100)
    : null;

  const toggleTime = (t: string) =>
    setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()));

  const addCustomTime = () => {
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(customTime) && !times.includes(customTime)) {
      setTimes((prev) => [...prev, customTime].sort());
    }
    setCustomTime('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: newId(),
      name: name.trim().slice(0, 80),
      dose: dose.trim().slice(0, 80),
      times,
      active: true,
      createdAt: new Date().toISOString(),
    });
    setName('');
    setDose('');
    setTimes(['08:00']);
    setShowForm(false);
  };

  const log = (med: Medication, time: string, status: MedIntake['status']) => {
    const existing = intakeFor(med.id, time);
    if (existing) onUndoIntake(existing.id);
    if (!existing || existing.status !== status) {
      onLogIntake({ id: newId(), medicationId: med.id, date: today, time, status, timestamp: new Date().toISOString() });
    }
  };

  return (
    <div className="space-y-4">
      {/* Erinnerungs-Status */}
      {permission === 'unsupported' ? (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500">
          🔔 Erinnerungen zur Einnahmezeit gibt es in der Android-App – im Browser wird nur protokolliert.
        </div>
      ) : permission === 'granted' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700">
          🔔 Erinnerungen aktiv – Sie werden zu jeder Einnahmezeit benachrichtigt.
        </div>
      ) : (
        <button
          onClick={onRequestPermission}
          className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left"
        >
          <p className="text-sm font-semibold text-blue-800">🔔 Erinnerungen einschalten</p>
          <p className="text-xs text-blue-600 mt-0.5">
            {permission === 'denied'
              ? 'Benachrichtigungen sind blockiert – bitte in den Android-Einstellungen für DiabetesGuard erlauben.'
              : 'Wir erinnern Sie pünktlich an jede Einnahme – der wichtigste Hebel für eine gute Einstellung.'}
          </p>
        </button>
      )}

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card !p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Heute</p>
          <p className="text-2xl font-extrabold text-gray-900 tabular-nums">{takenToday}<span className="text-gray-300 font-semibold"> / {schedule.length}</span></p>
          <p className="text-xs text-gray-400">eingenommen</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Einnahmetreue 7 Tage</p>
          <p className={`text-2xl font-extrabold tabular-nums ${adherence === null ? 'text-gray-300' : adherence >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
            {adherence !== null ? `${adherence} %` : '–'}
          </p>
          <p className="text-xs text-gray-400">Ziel: über 80 %</p>
        </div>
      </div>

      {/* Tagesplan */}
      {schedule.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">📋 Heute</h3>
          <div className="space-y-2">
            {schedule.map(({ med, time }) => {
              const intake = intakeFor(med.id, time);
              const taken = intake?.status === 'taken';
              const skipped = intake?.status === 'skipped';
              return (
                <div
                  key={`${med.id}-${time}`}
                  className={`flex items-center gap-3 rounded-xl p-3 border ${
                    taken ? 'bg-green-50 border-green-200' : skipped ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-100'
                  }`}
                >
                  <span className="text-sm font-bold text-gray-500 tabular-nums w-12">{time}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${taken ? 'text-green-800 line-through' : 'text-gray-800'}`}>{med.name}</p>
                    {med.dose && <p className="text-xs text-gray-400">{med.dose}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => log(med, time, 'taken')}
                      aria-label="Als eingenommen markieren"
                      className={`w-9 h-9 rounded-full text-base transition-all ${taken ? 'bg-green-600 text-white shadow-md shadow-green-600/30' : 'bg-gray-100 hover:bg-green-100'}`}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => log(med, time, 'skipped')}
                      aria-label="Als ausgelassen markieren"
                      className={`w-9 h-9 rounded-full text-base transition-all ${skipped ? 'bg-gray-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-400'}`}
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

      {/* Hinzufügen */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="card border-2 border-green-200 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Medikament hinzufügen</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name, z.B. Metformin"
            className="input-field"
            maxLength={80}
            required
            autoFocus
          />
          <input
            type="text"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="Dosis, z.B. 500 mg oder 1 Tablette"
            className="input-field"
            maxLength={80}
          />
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Einnahmezeiten</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {[...new Set([...PRESET_TIMES, ...times])].sort().map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTime(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tabular-nums transition-colors ${
                    times.includes(t) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="input-field !py-1.5 !px-3 text-sm w-32"
              />
              <button type="button" onClick={addCustomTime} className="btn-secondary !py-1.5 text-xs">+ Uhrzeit</button>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={times.length === 0}>Speichern</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Abbrechen</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full">
          + Medikament hinzufügen
        </button>
      )}

      {/* Liste */}
      {medications.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Meine Medikamente</h3>
          <div className="space-y-2">
            {medications.map((m) => (
              <div key={m.id} className={`flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 ${m.active ? '' : 'opacity-50'}`}>
                <span className="text-xl">💊</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{[m.dose, m.times.join(' · ')].filter(Boolean).join(' – ')}</p>
                </div>
                <button
                  onClick={() => onToggleActive(m.id)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {m.active ? 'Aktiv' : 'Pausiert'}
                </button>
                <button
                  onClick={() => { if (window.confirm(`„${m.name}" wirklich löschen?`)) onDelete(m.id); }}
                  aria-label="Medikament löschen"
                  className="text-gray-300 hover:text-red-400 text-sm px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {medications.length === 0 && !showForm && (
        <div className="text-center py-6 text-gray-400">
          <p className="text-4xl mb-2">💊</p>
          <p className="text-sm">Noch keine Medikamente. Metformin, Blutdrucksenker, Vitamine – alles, was regelmäßig dran ist.</p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        ⚕️ Die App erinnert nur an Ihre selbst eingetragenen Einnahmen – Dosierung und Änderungen bestimmt immer Ihr Arzt.
      </p>
    </div>
  );
}
