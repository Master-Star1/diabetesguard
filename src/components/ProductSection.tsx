import { products } from '../data/pregnancy';
import type { Profile } from '../types';

interface Props {
  profile: Profile;
}

/**
 * Produktempfehlungen mit Affiliate-Links. Rechtlich Pflicht: klare
 * Kennzeichnung als Anzeige (UWG). Bewusst getrennt von jeder
 * medizinischen Bewertung – hier steht nie „Ihr Wert ist hoch, kaufen Sie…".
 */
export function ProductSection({ profile }: Props) {
  const list = products.filter((p) => p.audience === 'all' || p.audience === profile);
  const anyLinks = list.some((p) => p.url);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">🛍️ Hilfreiche Produkte</h3>
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Anzeige</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Dinge, die den Alltag mit Blutzuckermessung leichter machen. Bei Kauf über einen Link erhalten wir eine kleine Provision – der Preis für Sie bleibt gleich.
      </p>
      <div className="space-y-2">
        {list.map((p) => (
          <div key={p.id} className="flex gap-3 items-start bg-gray-50 rounded-xl p-3">
            <span className="text-2xl">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">{p.why}</p>
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-block mt-2 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg"
                >
                  Ansehen → <span className="font-normal text-green-600">(Anzeige)</span>
                </a>
              ) : (
                <span className="inline-block mt-2 text-xs text-gray-400">Link folgt in Kürze</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {!anyLinks && (
        <p className="text-xs text-gray-400 mt-3">Die Produktlinks werden nach dem Start der App freigeschaltet.</p>
      )}
      <p className="text-xs text-gray-400 mt-3">
        ⚕️ Keine medizinische Empfehlung. Welches Messgerät und welche Teststreifen für Sie passen, klären Sie mit Ihrer Praxis.
      </p>
    </div>
  );
}
