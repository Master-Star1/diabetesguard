import { afterBirthSteps, pregnancyTargets, pregnancyWarningSigns } from '../data/pregnancy';
import type { GlucoseUnit } from '../types';

interface Props {
  unit: GlucoseUnit;
  onOpenSettings: () => void;
}

export function PregnancyGuide({ unit, onOpenSettings }: Props) {
  return (
    <div className="space-y-6">
      {/* Zielwerte */}
      <div className="card border-2 border-pink-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900">🤰 Ihre Zielwerte in der Schwangerschaft</h3>
          <button onClick={onOpenSettings} className="text-xs text-pink-600 hover:underline">Profil ändern</button>
        </div>
        <p className="text-xs text-gray-500 mb-3">Nach S3-Leitlinie Gestationsdiabetes (DDG/DGGG). Ihre Diabetologin kann individuell abweichen.</p>
        <div className="space-y-2">
          {pregnancyTargets.map((t) => (
            <div key={t.label} className="flex items-center justify-between bg-pink-50 rounded-xl px-4 py-2.5">
              <span className="text-sm text-gray-700">{t.label}</span>
              <span className="text-sm font-bold text-pink-700 tabular-nums">{unit === 'mmoll' ? t.mmol : t.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Messrhythmus meist: nüchtern + 1 h (oder 2 h) nach den drei Hauptmahlzeiten = 4 Messungen täglich. Der Tracker bietet dafür den Messzeitpunkt „1 h nach Mahlzeit".
        </p>
      </div>

      {/* Was ist das? */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-2">Was ist Schwangerschaftsdiabetes?</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Hormone der Plazenta machen den Körper ab dem zweiten Drittel unempfindlicher für Insulin. Bei etwa 5–8 % der
          Schwangeren reicht das eigene Insulin dann nicht mehr aus – der Blutzucker steigt. Das hat nichts mit
          Fehlverhalten zu tun. Mit Ernährungsumstellung und Bewegung kommen rund 80 % ohne Medikamente aus, und die
          Schwangerschaft verläuft in aller Regel normal.
        </p>
      </div>

      {/* Warnzeichen */}
      <div className="card border border-red-200 bg-red-50">
        <h3 className="font-semibold text-red-800 mb-2">🚨 Wann Sie sich melden sollten</h3>
        <ul className="space-y-1.5">
          {pregnancyWarningSigns.map((w) => (
            <li key={w} className="flex gap-2 text-xs text-red-800"><span>•</span><span>{w}</span></li>
          ))}
        </ul>
        <p className="text-xs text-red-700 mt-3 font-semibold">In diesen Fällen: Diabetologin, Frauenärztin oder die Klinik anrufen – auch am Wochenende.</p>
      </div>

      {/* Nach der Geburt */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">👶 Und nach der Geburt?</h3>
        <div className="space-y-3">
          {afterBirthSteps.map((s) => (
            <div key={s.title} className="flex gap-3">
              <span className="text-2xl shrink-0">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 leading-snug">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
