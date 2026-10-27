import type { Profile } from '../types';
import { pregnancyWeek } from '../utils/health';

interface Props {
  profile: Profile;
  dueDate: string | null;
  onChange: (profile: Profile, dueDate: string | null) => void;
  compact?: boolean;
}

/**
 * Umschalter Standard ↔ Schwangerschaftsdiabetes. Steuert Zielwerte,
 * Messzeitpunkte, Statistik, Tipps und Arztbericht in der gesamten App.
 */
export function ProfileSelector({ profile, dueDate, onChange, compact }: Props) {
  const ssw = pregnancyWeek(dueDate);
  return (
    <div className={compact ? '' : 'card'}>
      {!compact && (
        <>
          <h3 className="font-semibold text-gray-900 mb-1">🎯 Mein Profil</h3>
          <p className="text-xs text-gray-500 mb-3">Bestimmt, welche Zielwerte und Tipps die App verwendet.</p>
        </>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('standard', null)}
          className={`text-left p-3 rounded-xl border-2 transition-all ${profile === 'standard' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
        >
          <p className="text-sm font-semibold text-gray-800">🩸 Standard</p>
          <p className="text-xs text-gray-500 mt-0.5">Typ 2, Prädiabetes, Vorsorge</p>
        </button>
        <button
          type="button"
          onClick={() => onChange('pregnancy', dueDate)}
          className={`text-left p-3 rounded-xl border-2 transition-all ${profile === 'pregnancy' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'}`}
        >
          <p className="text-sm font-semibold text-gray-800">🤰 Schwangerschaft</p>
          <p className="text-xs text-gray-500 mt-0.5">Gestationsdiabetes, strengere Zielwerte</p>
        </button>
      </div>

      {profile === 'pregnancy' && (
        <div className="mt-3 bg-pink-50 border border-pink-200 rounded-xl p-3">
          <label className="text-xs font-medium text-pink-900 block mb-1.5">Errechneter Geburtstermin (optional)</label>
          <input
            type="date"
            value={dueDate ?? ''}
            onChange={(e) => onChange('pregnancy', e.target.value || null)}
            className="input-field !py-2 text-sm"
          />
          <p className="text-xs text-pink-700 mt-2">
            {ssw
              ? `Sie sind in SSW ${ssw.week}+${ssw.day} – noch ${ssw.daysLeft} Tage bis zum Termin.`
              : 'Mit Termin zeigt das Dashboard Ihre Schwangerschaftswoche an.'}
          </p>
          <p className="text-xs text-pink-700 mt-1">
            Zielwerte nach S3-Leitlinie: nüchtern &lt; 95, 1 h &lt; 140, 2 h &lt; 120 mg/dL.
          </p>
        </div>
      )}
    </div>
  );
}
