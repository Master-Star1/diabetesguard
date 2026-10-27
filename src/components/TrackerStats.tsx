import { useState } from 'react';
import type { BloodSugarEntry, GlucoseUnit, Medication, Profile, Subscription, WeightEntry } from '../types';
import { contextLabel, tirRange } from '../utils/health';
import { toDisplayUnit, unitLabel } from '../types';
import { PremiumGate } from './PremiumGate';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { saveFile, todayStamp } from '../utils/files';
import { buildDoctorReport } from '../utils/report';
import { analyzePatterns } from '../utils/patterns';

interface Props {
  entries: BloodSugarEntry[];
  weightEntries: WeightEntry[];
  medications: Medication[];
  unit: GlucoseUnit;
  profile: Profile;
  subscription: Subscription;
  onUpgrade: () => void;
}

const severityStyle = {
  warn: 'bg-orange-50 border-orange-200',
  info: 'bg-blue-50 border-blue-200',
  good: 'bg-green-50 border-green-200',
};

// Geschätzter HbA1c nach ADAG-Studienformel: A1c (%) = (eAG mg/dL + 46.7) / 28.7
function estimateHbA1c(avgMgdl: number): number {
  return Math.round(((avgMgdl + 46.7) / 28.7) * 10) / 10;
}

function hba1cRating(a1c: number) {
  if (a1c < 5.7) return { label: 'Normalbereich', color: 'text-green-600', bg: 'bg-green-50', hint: 'Ihre Werte entsprechen einem gesunden Stoffwechsel.' };
  if (a1c < 6.5) return { label: 'Prädiabetes-Bereich', color: 'text-yellow-600', bg: 'bg-yellow-50', hint: 'Grenzwertig – sprechen Sie mit Ihrem Arzt über eine Kontrolle.' };
  return { label: 'Diabetes-Bereich', color: 'text-red-600', bg: 'bg-red-50', hint: 'Bitte lassen Sie einen Labor-HbA1c beim Arzt bestimmen!' };
}

function avgOf(entries: BloodSugarEntry[]): number | null {
  if (entries.length === 0) return null;
  return Math.round(entries.reduce((s, e) => s + e.value, 0) / entries.length);
}

function entriesSince(entries: BloodSugarEntry[], days: number): BloodSugarEntry[] {
  const cutoff = Date.now() - days * 86400000;
  return entries.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}

// Schutz vor CSV-Injection: Excel/LibreOffice führen Zellen aus, die mit
// = + - @ oder Tab/CR beginnen, als Formel aus. Freitext wird daher neutralisiert.
function csvCell(raw: string): string {
  let s = raw.replace(/[\r\n]+/g, ' ').replace(/;/g, ',');
  if (/^[=+\-@\t]/.test(s)) s = "'" + s;
  return s;
}

function buildCsv(entries: BloodSugarEntry[], unit: GlucoseUnit, profile: Profile): string {
  const moodLabels: Record<string, string> = { good: 'Gut', neutral: 'Okay', bad: 'Schlecht' };
  const header = `Datum;Uhrzeit;Wert (${unitLabel(unit)});Messzeitpunkt;KH (g);Stimmung;Tags;Notizen`;
  const rows = entries.map((e) => {
    const d = new Date(e.timestamp);
    return [
      d.toLocaleDateString('de-DE'),
      d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      String(toDisplayUnit(e.value, unit)).replace('.', ','),
      contextLabel(e.mealContext, profile),
      e.carbs !== undefined ? String(e.carbs) : '',
      e.mood ? moodLabels[e.mood] : '',
      csvCell((e.tags ?? []).join(', ')),
      csvCell(e.notes ?? ''),
    ].join(';');
  });
  return [header, ...rows].join('\n');
}

export function TrackerStats({ entries, weightEntries, medications, unit, profile, subscription, onUpgrade }: Props) {
  const { isPremium, canExportPDF } = usePlanFeatures(subscription);
  const [reportDays, setReportDays] = useState<30 | 90>(30);
  const [busy, setBusy] = useState(false);
  const insights = analyzePatterns(entries, profile);
  const [tirLow, tirHigh] = tirRange(profile);

  const avg7 = avgOf(entriesSince(entries, 7));
  const avg30 = avgOf(entriesSince(entries, 30));
  const avg90 = avgOf(entriesSince(entries, 90));

  // Zeit im Zielbereich (Time in Range): 70–180 mg/dL, internationaler Konsens-Standard
  const last30 = entriesSince(entries, 30);
  const tirBase = last30.length > 0 ? last30 : entries;
  const inRange = tirBase.filter((e) => e.value >= tirLow && e.value <= tirHigh).length;
  const below = tirBase.filter((e) => e.value < tirLow).length;
  const above = tirBase.filter((e) => e.value > tirHigh).length;
  const tirPct = tirBase.length > 0 ? Math.round((inRange / tirBase.length) * 100) : null;
  const belowPct = tirBase.length > 0 ? Math.round((below / tirBase.length) * 100) : 0;
  const abovePct = tirBase.length > 0 ? Math.round((above / tirBase.length) * 100) : 0;

  const values = entries.map((e) => e.value);
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;

  const a1c = avg90 !== null && entriesSince(entries, 90).length >= 5 ? estimateHbA1c(avg90) : null;

  const handleExport = async () => {
    setBusy(true);
    try {
      const csv = buildCsv(entries, unit, profile);
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
      await saveFile(`blutzucker-daten-${todayStamp()}.csv`, blob);
    } finally {
      setBusy(false);
    }
  };

  const handlePdf = async () => {
    setBusy(true);
    try {
      const blob = buildDoctorReport({ entries, weights: weightEntries, medications, unit, profile, days: reportDays });
      await saveFile(`diabetesguard-arztbericht-${reportDays}tage-${todayStamp()}.pdf`, blob);
    } finally {
      setBusy(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-semibold text-gray-700">Noch keine Statistiken</p>
        <p className="text-sm text-gray-400 mt-1">Tragen Sie Blutzuckerwerte ein, um Auswertungen zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Durchschnitte */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ø 7 Tage', value: avg7 },
          { label: 'Ø 30 Tage', value: avg30 },
          { label: 'Ø 90 Tage', value: avg90 },
        ].map((s) => (
          <div key={s.label} className="card !p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">
              {s.value !== null ? toDisplayUnit(s.value, unit) : '–'}
            </p>
            <p className="text-xs text-gray-400">{unitLabel(unit)}</p>
          </div>
        ))}
      </div>

      {/* Zeit im Zielbereich */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">🎯 Zeit im Zielbereich</h3>
          <span className="text-xs text-gray-400">{last30.length > 0 ? 'letzte 30 Tage' : 'alle Messungen'}</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Anteil der Messungen zwischen {tirLow}–{tirHigh} mg/dL ({String(toDisplayUnit(tirLow, 'mmoll')).replace('.', ',')}–{String(toDisplayUnit(tirHigh, 'mmoll')).replace('.', ',')} mmol/L){profile === 'pregnancy' ? ' – Zielbereich Schwangerschaft' : ''}. Ziel: über 70 %.
        </p>
        {tirPct !== null && (
          <>
            <div className="flex items-end gap-2 mb-2">
              <p className={`text-3xl font-bold ${tirPct >= 70 ? 'text-green-600' : tirPct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {tirPct}%
              </p>
              <p className="text-xs text-gray-400 pb-1.5">im Zielbereich</p>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
              {belowPct > 0 && <div className="bg-red-400" style={{ width: `${belowPct}%` }} title="Zu niedrig" />}
              <div className="bg-green-500" style={{ width: `${tirPct}%` }} />
              {abovePct > 0 && <div className="bg-orange-400" style={{ width: `${abovePct}%` }} title="Zu hoch" />}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>🔻 Zu niedrig: {belowPct}%</span>
              <span>✅ Im Ziel: {tirPct}%</span>
              <span>🔺 Zu hoch: {abovePct}%</span>
            </div>
          </>
        )}
      </div>

      {/* HbA1c-Schätzung (Premium) */}
      {isPremium ? (
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">🧪 Geschätzter HbA1c (Langzeitblutzucker)</h3>
          </div>
          {a1c !== null ? (
            <>
              <div className={`rounded-xl p-4 mt-2 ${hba1cRating(a1c).bg}`}>
                <div className="flex items-end gap-3">
                  <p className={`text-3xl font-bold ${hba1cRating(a1c).color}`}>{String(a1c).replace('.', ',')}%</p>
                  <p className={`text-sm font-semibold pb-1 ${hba1cRating(a1c).color}`}>{hba1cRating(a1c).label}</p>
                </div>
                <p className="text-xs text-gray-600 mt-2">{hba1cRating(a1c).hint}</p>
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                <span>Normal: &lt; 5,7%</span>
                <span>Prädiabetes: 5,7–6,4%</span>
                <span>Diabetes: ≥ 6,5%</span>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                ⚕️ Schätzung aus Ihrem 90-Tage-Durchschnitt (ADAG-Formel). Ersetzt keine Labormessung.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              Mindestens 5 Messungen in den letzten 90 Tagen nötig ({entriesSince(entries, 90).length} vorhanden).
            </p>
          )}
        </div>
      ) : (
        <PremiumGate
          feature="HbA1c-Schätzung"
          description="Ihr geschätzter Langzeitblutzucker aus 90 Tagen Messdaten – der Wert, den auch Ihr Arzt bewertet."
          onUpgrade={onUpgrade}
        />
      )}

      {/* Musteranalyse */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">🔎 Muster &amp; Erkenntnisse</h3>
          <span className="text-xs text-gray-400">letzte 30 Tage</span>
        </div>
        {insights.length === 0 ? (
          <p className="text-xs text-gray-500 mt-2">
            Ab 5 Messungen in 30 Tagen erkennt die App Zusammenhänge – Tageszeiten, Wochentage, Tags wie „Sport" oder „Stress". Je mehr Details Sie erfassen, desto klarer das Bild.
          </p>
        ) : (
          <div className="space-y-2 mt-3">
            {insights.map((ins) => (
              <div key={ins.id} className={`rounded-xl border p-3 flex gap-3 ${severityStyle[ins.severity]}`}>
                <span className="text-xl shrink-0">{ins.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{ins.title}</p>
                  <p className="text-xs text-gray-600 leading-snug mt-0.5">{ins.text}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400 pt-1">
              ⚕️ Rein beschreibende Auswertung Ihrer eigenen Einträge – keine Therapieempfehlung.
            </p>
          </div>
        )}
      </div>

      {/* Min/Max */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card !p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Niedrigster Wert</p>
          <p className="text-xl font-bold text-blue-600">{min !== null ? toDisplayUnit(min, unit) : '–'}</p>
          <p className="text-xs text-gray-400">{unitLabel(unit)}</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Höchster Wert</p>
          <p className="text-xl font-bold text-orange-600">{max !== null ? toDisplayUnit(max, unit) : '–'}</p>
          <p className="text-xs text-gray-400">{unitLabel(unit)}</p>
        </div>
      </div>

      {/* Arzt-Export */}
      <div className="card border border-blue-200 bg-blue-50">
        <h3 className="font-semibold text-blue-800 text-sm mb-1">📄 Bericht für den Arztbesuch</h3>
        <p className="text-xs text-blue-700 mb-3">
          PDF mit Zusammenfassung, Verlaufskurve, Messtabelle und Medikationsplan – oder alle Rohdaten als CSV für Excel.
        </p>
        {canExportPDF ? (
          <div className="space-y-2">
            <div className="flex bg-white/70 rounded-lg p-0.5">
              {([30, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setReportDays(d)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${reportDays === d ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-500'}`}
                >
                  Letzte {d} Tage
                </button>
              ))}
            </div>
            <button onClick={handlePdf} disabled={busy} className="btn-primary w-full text-sm !py-2.5 disabled:opacity-60">
              📄 PDF-Arztbericht erstellen
            </button>
            <button onClick={handleExport} disabled={busy} className="btn-secondary w-full text-sm !py-2.5 disabled:opacity-60">
              ⬇️ Rohdaten als CSV ({entries.length} Messungen)
            </button>
          </div>
        ) : (
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            👑 Export mit Premium freischalten
          </button>
        )}
      </div>
    </div>
  );
}
