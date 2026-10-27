import { useRef, useState } from 'react';
import { saveFile, todayStamp } from '../utils/files';
import {
  validateAssessment, validateBloodSugarEntries, validateIntakes, validateMedications,
  validateSettings, validateWeightEntries,
} from '../utils/health';

const BACKUP_VERSION = 1;

// Alle Schlüssel, die die App in localStorage nutzt – Abo-Status wird bewusst
// nicht exportiert/importiert.
const KEYS = {
  blood_sugar_entries: validateBloodSugarEntries,
  weight_entries: validateWeightEntries,
  medications: validateMedications,
  med_intakes: validateIntakes,
  last_assessment: validateAssessment,
  app_settings: validateSettings,
} as const;

/**
 * Backup, Wiederherstellung und vollständige Löschung – DSGVO-Recht auf
 * Datenübertragbarkeit und Löschung, rein lokal umgesetzt.
 */
export function DataManagement() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleExport = async () => {
    const data: Record<string, unknown> = { version: BACKUP_VERSION, exportedAt: new Date().toISOString() };
    for (const key of Object.keys(KEYS)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) data[key] = JSON.parse(raw);
      } catch { /* beschädigter Eintrag wird übersprungen */ }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    await saveFile(`diabetesguard-backup-${todayStamp()}.json`, blob);
    setMessage({ text: 'Backup erstellt.', ok: true });
  };

  const handleImport = async (file: File) => {
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Datei zu groß');
      const parsed: unknown = JSON.parse(await file.text());
      if (typeof parsed !== 'object' || parsed === null) throw new Error('Kein gültiges Backup');
      const obj = parsed as Record<string, unknown>;

      let imported = 0;
      for (const [key, validate] of Object.entries(KEYS)) {
        if (!(key in obj)) continue;
        const clean = (validate as (raw: unknown) => unknown)(obj[key]);
        if (clean === null) continue;
        localStorage.setItem(key, JSON.stringify(clean));
        imported++;
      }
      if (imported === 0) throw new Error('Keine verwertbaren Daten gefunden');
      setMessage({ text: 'Backup wiederhergestellt – App wird neu geladen…', ok: true });
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMessage({ text: `Import fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`, ok: false });
    }
  };

  const handleDeleteAll = () => {
    const sure = window.confirm(
      'Wirklich ALLE Daten löschen?\n\nBlutzucker, Gewicht, Medikamente, Risikotest – alles wird unwiderruflich entfernt. Erstellen Sie vorher ein Backup.',
    );
    if (!sure) return;
    for (const key of Object.keys(KEYS)) localStorage.removeItem(key);
    window.location.reload();
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-1">🔐 Meine Daten</h3>
      <p className="text-xs text-gray-500 mb-4">
        Alles bleibt auf diesem Gerät. Für einen Handywechsel oder zur Sicherheit: Backup erstellen und später wieder einspielen.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleExport} className="btn-secondary text-sm !py-2.5">
          ⬇️ Backup erstellen
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm !py-2.5">
          ⬆️ Backup einspielen
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImport(f);
            e.target.value = '';
          }}
        />
      </div>
      {message && (
        <p className={`text-xs mt-3 ${message.ok ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
      )}
      <button
        onClick={handleDeleteAll}
        className="w-full mt-4 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        Alle Daten unwiderruflich löschen
      </button>
    </div>
  );
}
