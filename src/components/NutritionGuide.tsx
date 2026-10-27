import { useState } from 'react';
import { getDailyTip, nutritionTips } from '../data/nutritionTips';
import { pregnancyTips } from '../data/pregnancy';
import type { GlucoseUnit, NutritionTip, Profile, Subscription } from '../types';
import { PregnancyGuide } from './PregnancyGuide';
import { ProductSection } from './ProductSection';
import { PremiumBadge } from './PremiumGate';
import { usePlanFeatures } from '../hooks/usePlanFeatures';

const categoryConfig = {
  food: { label: 'Ernährung', color: 'bg-green-100 text-green-700', icon: '🥗' },
  lifestyle: { label: 'Lebensstil', color: 'bg-blue-100 text-blue-700', icon: '🌱' },
  monitoring: { label: 'Kontrolle', color: 'bg-purple-100 text-purple-700', icon: '📊' },
  exercise: { label: 'Bewegung', color: 'bg-orange-100 text-orange-700', icon: '🏃' },
};

type Category = keyof typeof categoryConfig | 'all';

const STANDARD_PLAN = [
  { time: 'Frühstück', meal: 'Haferflocken mit Beeren + Zimt + Mandeln', tip: 'Kein Frühstückssaft!', icon: '🌅' },
  { time: 'Vormittag-Snack', meal: 'Handvoll Walnüsse + 1 Apfel', tip: 'Stabilisiert Blutzucker bis Mittag', icon: '☀️' },
  { time: 'Mittagessen', meal: '½ Teller Gemüse + Hähnchen/Fisch + Quinoa/Linsen', tip: 'Erst Gemüse essen!', icon: '🥗' },
  { time: 'Nachmittag-Snack', meal: 'Naturjoghurt + Gurkensticks oder Tomaten', tip: 'Kein Süßkram!', icon: '🌤️' },
  { time: 'Abendessen', meal: 'Viel Gemüse + mageres Protein, wenig Kohlenhydrate', tip: 'Früh essen (vor 19 Uhr)', icon: '🌙' },
];

// Schwangerschaft: Frühstück bewusst kohlenhydratarm (morgens höchste Insulinresistenz),
// 5–6 kleine Mahlzeiten, Spätmahlzeit gegen hohe Nüchternwerte
const PREGNANCY_PLAN = [
  { time: 'Frühstück', meal: 'Vollkornbrot (1 Scheibe) mit Ei, Käse oder Frischkäse + Gurke/Tomate', tip: 'Max. 15–30 g KH, kein Obst, kein Saft', icon: '🌅' },
  { time: 'Vormittag-Snack', meal: 'Naturjoghurt mit Nüssen oder 1 Handvoll Beeren mit Quark', tip: 'Obst nur zusammen mit Eiweiß', icon: '☀️' },
  { time: 'Mittagessen', meal: '½ Teller Gemüse + Fisch/Geflügel/Hülsenfrüchte + kleine Portion Vollkorn', tip: 'Danach 15 Min. gehen', icon: '🥗' },
  { time: 'Nachmittag-Snack', meal: 'Gemüsesticks mit Hummus oder Bitterschokolade (2 Stück)', tip: 'Heißhunger abfangen', icon: '🌤️' },
  { time: 'Abendessen', meal: 'Gemüsepfanne mit Tofu/Hähnchen, wenig Kartoffeln oder Vollkornreis', tip: 'Eiweißreich, nicht zu spät', icon: '🌙' },
  { time: 'Spätmahlzeit', meal: 'Kleine Portion: Vollkornknäcke mit Käse oder Joghurt mit Nüssen', tip: 'Senkt oft den Nüchternwert', icon: '🌜' },
];

interface Props {
  subscription: Subscription;
  profile: Profile;
  unit: GlucoseUnit;
  onUpgrade: () => void;
  onOpenSettings: () => void;
}

export function NutritionGuide({ subscription, profile, unit, onUpgrade, onOpenSettings }: Props) {
  const isPregnancy = profile === 'pregnancy';
  const tipPool = isPregnancy ? pregnancyTips : nutritionTips;
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const { isPremium, maxTipsVisible, canViewMealPlan } = usePlanFeatures(subscription);

  const dailyTip = getDailyTip(profile);

  const allFiltered = selectedCategory === 'all'
    ? tipPool
    : tipPool.filter((t) => t.category === selectedCategory);

  // Schwangerschafts-Tipps sind sicherheitsrelevant und deshalb nie gesperrt
  const visibleTips = isPremium || isPregnancy ? allFiltered : allFiltered.slice(0, maxTipsVisible);
  const hiddenCount = allFiltered.length - visibleTips.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ernährungsführer</h2>
        <p className="text-sm text-gray-500">{isPregnancy ? 'Tipps für die Schwangerschaft mit Diabetes' : 'Täglich neue Tipps für ein Leben mit besserem Blutzucker'}</p>
      </div>

      {isPregnancy && <PregnancyGuide unit={unit} onOpenSettings={onOpenSettings} />}

      {/* Tipp des Tages – Hero */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-2xl p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              ✨ Tipp des Tages
            </span>
            <span className="text-white/60 text-xs">{categoryConfig[dailyTip.category].label}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-5xl">{dailyTip.icon}</span>
            <div>
              <h3 className="font-bold text-xl leading-tight mb-2">{dailyTip.title}</h3>
              <p className="text-green-100 text-sm leading-relaxed">{dailyTip.content}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Tage Ernährungsplan */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">🗓️ {isPregnancy ? 'Tagesplan Schwangerschaft' : 'Einfacher Tagesplan'}</h3>
          {!canViewMealPlan && <PremiumBadge />}
        </div>
        {!canViewMealPlan ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">Der vollständige Mahlzeitenplan ist nur in Premium verfügbar.</p>
            <button onClick={onUpgrade} className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold py-2 px-5 rounded-xl text-sm">
              👑 Premium freischalten
            </button>
          </div>
        ) : (
        <div className="space-y-3">
          {(isPregnancy ? PREGNANCY_PLAN : STANDARD_PLAN).map((item) => (
            <div key={item.time} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{item.time}</p>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{item.tip}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{item.meal}</p>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Symptom Guide */}
      <div className="card border border-amber-200 bg-amber-50">
        <h3 className="font-semibold text-amber-800 mb-3">⚠️ Mögliche Diabetes-Symptome erkennen</h3>
        <p className="text-xs text-amber-700 mb-3">Diese Symptome können auf erhöhten Blutzucker hinweisen – bitte einen Arzt aufsuchen!</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { symptom: 'Starker Durst', detail: 'Mehr als 3 Liter/Tag' },
            { symptom: 'Häufiges Wasserlassen', detail: 'Auch nachts' },
            { symptom: 'Extremmüdigkeit', detail: 'Trotz ausreichend Schlaf' },
            { symptom: 'Verschwommenes Sehen', detail: 'Plötzlich oder zunehmend' },
            { symptom: 'Langsame Wundheilung', detail: 'Kleine Wunden heilen schlecht' },
            { symptom: 'Kribbeln/Taubheit', detail: 'In Händen oder Füßen' },
            { symptom: 'Heißhunger', detail: 'Besonders auf Süßes' },
            { symptom: 'Gewichtsverlust', detail: 'Ohne zu diäten' },
          ].map((s) => (
            <div key={s.symptom} className="flex items-start gap-2 text-xs">
              <span className="text-amber-500 mt-0.5">●</span>
              <div>
                <p className="font-semibold text-amber-800">{s.symptom}</p>
                <p className="text-amber-600">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notfallkarte */}
      <div className="card border-2 border-red-200">
        <h3 className="font-semibold text-red-700 mb-3">🚨 Notfallkarte: Was tun im Ernstfall?</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-bold text-blue-800 mb-1">🔻 Unterzuckerung (unter 70 mg/dL / 3,9 mmol/L)</p>
            <p className="text-xs text-blue-700 mb-2">Anzeichen: Zittern, Schwitzen, Herzrasen, Heißhunger, Verwirrtheit</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p><strong>1.</strong> Sofort 15–20g schnellen Zucker: 4 Stück Traubenzucker, 200ml Saft oder Cola (kein Light!)</p>
              <p><strong>2.</strong> 15 Minuten warten, dann erneut messen</p>
              <p><strong>3.</strong> Immer noch unter 70? → Schritt 1 wiederholen</p>
              <p><strong>4.</strong> Danach langsame Kohlenhydrate essen (Brot, Banane)</p>
              <p className="text-red-600 font-semibold pt-1">Bei Bewusstlosigkeit: Notruf 112 – nichts einflößen!</p>
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-sm font-bold text-orange-800 mb-1">🔺 Starke Überzuckerung (über 250 mg/dL / 13,9 mmol/L)</p>
            <p className="text-xs text-orange-700 mb-2">Anzeichen: Extremer Durst, Übelkeit, Bauchschmerzen, fruchtiger Atemgeruch</p>
            <div className="space-y-1 text-xs text-orange-800">
              <p><strong>1.</strong> Viel Wasser trinken (kein Zucker!)</p>
              <p><strong>2.</strong> Leichte Bewegung nur wenn keine Ketone/Übelkeit</p>
              <p><strong>3.</strong> Nach 2 Stunden erneut messen</p>
              <p className="text-red-600 font-semibold pt-1">Bei Übelkeit, Erbrechen oder Werten über 400: Sofort zum Arzt / Notruf 112!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            Alle Tipps ({tipPool.length})
          </h3>
          {!isPremium && !isPregnancy && (
            <span className="text-xs text-gray-400">{maxTipsVisible} von {tipPool.length} sichtbar</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Alle
          </button>
          {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-gray-800 text-white'
                  : categoryConfig[cat].color
              }`}
            >
              {categoryConfig[cat].icon} {categoryConfig[cat].label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {visibleTips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              isExpanded={expandedTip === tip.id}
              onToggle={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
            />
          ))}
        </div>

        {/* Premium upsell for locked tips */}
        {hiddenCount > 0 && (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-yellow-300 bg-yellow-50 p-5 text-center">
            <PremiumBadge className="mb-2" />
            <p className="text-sm font-semibold text-gray-800 mt-2">
              + {hiddenCount} weitere Tipps gesperrt
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Alle Ernährungs-, Lebensstil- und Bewegungstipps freischalten
            </p>
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-2 px-5 rounded-xl text-sm"
            >
              Jetzt freischalten
            </button>
          </div>
        )}
      </div>

      {/* Produktempfehlungen (Anzeige) */}
      <ProductSection profile={profile} />
    </div>
  );
}

function TipCard({ tip, isExpanded, onToggle }: { tip: NutritionTip; isExpanded: boolean; onToggle: () => void }) {
  const config = categoryConfig[tip.category];
  return (
    <button
      onClick={onToggle}
      className="w-full card text-left hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{tip.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className="font-semibold text-gray-900 text-sm">{tip.title}</p>
          {isExpanded && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{tip.content}</p>
          )}
        </div>
        <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
      </div>
    </button>
  );
}
