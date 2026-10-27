import { useState } from 'react';
import type { Profile } from '../types';
import { ProfileSelector } from './ProfileSelector';

interface Props {
  onAccept: (profile: Profile, dueDate: string | null) => void;
}

const slides = [
  {
    icon: '💙',
    title: 'Willkommen bei DiabetesGuard',
    text: 'Ihr persönliches Blutzucker-Tagebuch mit Risikotest, Auswertungen, Medikamenten-Erinnerungen und täglichen Ernährungstipps.',
  },
  {
    icon: '📱',
    title: 'Ihre Daten bleiben bei Ihnen',
    text: 'Alles wird ausschließlich auf diesem Gerät gespeichert. Kein Konto, keine Cloud, keine Werbung, kein Tracking. Für den Handywechsel gibt es eine Backup-Funktion.',
  },
  {
    icon: '🎯',
    title: 'Für wen ist die App?',
    text: 'Wählen Sie Ihr Profil – die Zielwerte, Messzeitpunkte und Tipps passen sich an. Sie können das jederzeit unter „Meine Daten" ändern.',
    profile: true,
  },
  {
    icon: '⚕️',
    title: 'Wichtiger Hinweis',
    text: 'DiabetesGuard ist kein Medizinprodukt und ersetzt keine ärztliche Diagnose oder Behandlung. Risikotest, HbA1c-Schätzung und Musteranalyse sind Orientierungshilfen. Therapieentscheidungen trifft immer Ihr Arzt.',
    consent: true,
  },
];

/**
 * Erster Start: kurze Einführung + ausdrücklicher medizinischer Hinweis,
 * der aktiv bestätigt werden muss (Play-Store-Anforderung für Gesundheits-Apps).
 */
export function Onboarding({ onAccept }: Props) {
  const [index, setIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [profile, setProfile] = useState<Profile>('standard');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const slide = slides[index];
  const last = index === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 flex flex-col" style={{ minHeight: 440 }}>
        <div className="flex-1 text-center">
          <div className="w-20 h-20 mx-auto bg-green-50 rounded-2xl flex items-center justify-center text-4xl mb-5">
            {slide.icon}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-3">{slide.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{slide.text}</p>

          {'profile' in slide && slide.profile && (
            <div className="mt-5 text-left">
              <ProfileSelector compact profile={profile} dueDate={dueDate} onChange={(p, d) => { setProfile(p); setDueDate(d); }} />
            </div>
          )}

          {'consent' in slide && slide.consent && (
            <label className="mt-5 flex items-start gap-3 text-left bg-amber-50 border border-amber-200 rounded-xl p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-green-600"
              />
              <span className="text-xs text-amber-900 leading-snug">
                Ich habe verstanden, dass diese App keine ärztliche Beratung ersetzt, und habe die{' '}
                <a href={`${import.meta.env.BASE_URL}datenschutz.html`} target="_blank" rel="noreferrer" className="underline font-semibold">
                  Datenschutzerklärung
                </a>{' '}
                gelesen.
              </span>
            </label>
          )}
        </div>

        {/* Punkte */}
        <div className="flex justify-center gap-1.5 my-5">
          {slides.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-green-600' : 'w-1.5 bg-gray-200'}`} />
          ))}
        </div>

        <div className="flex gap-3">
          {index > 0 && (
            <button onClick={() => setIndex(index - 1)} className="btn-secondary">
              Zurück
            </button>
          )}
          {last ? (
            <button onClick={() => onAccept(profile, dueDate)} disabled={!accepted} className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
              Los geht's
            </button>
          ) : (
            <button onClick={() => setIndex(index + 1)} className="btn-primary flex-1">
              Weiter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
