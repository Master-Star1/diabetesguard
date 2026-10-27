import { useState } from 'react';
import { foods } from '../data/foods';
import type { Food, Subscription } from '../types';

import { usePlanFeatures } from '../hooks/usePlanFeatures';

const categoryConfig = {
  excellent: { label: 'Empfohlen', color: 'bg-green-100 text-green-700', border: 'border-green-200', dot: 'bg-green-500', icon: '✅' },
  good: { label: 'Gut', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', icon: '👍' },
  moderate: { label: 'In Maßen', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500', icon: '⚠️' },
  avoid: { label: 'Meiden', color: 'bg-red-100 text-red-700', border: 'border-red-200', dot: 'bg-red-500', icon: '🚫' },
};

type Category = keyof typeof categoryConfig | 'all';

function GIBar({ value }: { value: number }) {
  const color = value < 40 ? 'bg-green-500' : value < 56 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-500 w-6 text-right">{value}</span>
    </div>
  );
}

function FoodCard({ food }: { food: Food }) {
  const config = categoryConfig[food.category];
  return (
    <div className={`bg-white rounded-2xl border ${config.border} p-4 shadow-sm`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{food.emoji}</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{food.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
              {config.icon} {config.label}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div>
          <p className="text-xs text-gray-400 mb-1">Glykämischer Index</p>
          <GIBar value={food.glycemicIndex} />
        </div>
        <div>
          <p className="text-xs text-gray-500 leading-relaxed">{food.benefit}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Portion:</span>
          <span className="text-xs font-medium text-gray-600">{food.portion}</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  subscription: Subscription;
  onUpgrade: () => void;
}

// Free users see only the 'excellent' category fully; other categories are teased
const FREE_VISIBLE_FOODS = 12;

export function FoodGuide({ subscription, onUpgrade }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { isPremium } = usePlanFeatures(subscription);

  const filtered = foods.filter((f) => {
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.benefit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleFoods = isPremium ? filtered : filtered.slice(0, FREE_VISIBLE_FOODS);
  const hiddenFoodCount = filtered.length - visibleFoods.length;

  const counts = {
    excellent: foods.filter((f) => f.category === 'excellent').length,
    good: foods.filter((f) => f.category === 'good').length,
    moderate: foods.filter((f) => f.category === 'moderate').length,
    avoid: foods.filter((f) => f.category === 'avoid').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Lebensmittelführer</h2>
        <p className="text-sm text-gray-500">Was gut ist – und was man besser meidet</p>
      </div>

      {/* GI Explanation */}
      <div className="card bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">📊 Glykämischer Index (GI) erklärt</h3>
        <p className="text-xs text-gray-600 mb-3">Der GI misst, wie schnell Kohlenhydrate den Blutzucker erhöhen (0-100).</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-green-50 rounded-xl p-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1" />
            <p className="text-xs font-bold text-green-700">GI &lt; 40</p>
            <p className="text-xs text-gray-500">Niedrig</p>
          </div>
          <div className="text-center bg-yellow-50 rounded-xl p-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1" />
            <p className="text-xs font-bold text-yellow-700">GI 40–55</p>
            <p className="text-xs text-gray-500">Mittel</p>
          </div>
          <div className="text-center bg-red-50 rounded-xl p-2">
            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1" />
            <p className="text-xs font-bold text-red-700">GI &gt; 55</p>
            <p className="text-xs text-gray-500">Hoch</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="🔍 Lebensmittel suchen..."
        className="input-field"
      />

      {/* Category Filter */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`py-2 rounded-xl text-sm font-medium transition-colors ${
            activeCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Alle ({foods.length})
        </button>
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-gray-800 text-white'
                : categoryConfig[cat].color
            }`}
          >
            {categoryConfig[cat].icon} {categoryConfig[cat].label} ({counts[cat]})
          </button>
        ))}
      </div>

      {/* Free plan label */}
      {!isPremium && (
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{visibleFoods.length} von {filtered.length} Lebensmitteln sichtbar</span>
          <button onClick={onUpgrade} className="text-orange-500 font-semibold hover:underline">👑 Alle freischalten</button>
        </div>
      )}

      {/* Food Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleFoods.map((food) => (
          <FoodCard key={food.name} food={food} />
        ))}
      </div>

      {/* Premium gate for hidden foods */}
      {hiddenFoodCount > 0 && (
        <div className="rounded-2xl border-2 border-dashed border-yellow-300 bg-yellow-50 p-5 text-center">
          <span className="text-3xl mb-2 block">🔒</span>
          <p className="text-sm font-semibold text-gray-800">+ {hiddenFoodCount} weitere Lebensmittel gesperrt</p>
          <p className="text-xs text-gray-500 mb-3">Vollständiger Lebensmittelführer nur in Premium</p>
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-2 px-5 rounded-xl text-sm"
          >
            👑 Jetzt freischalten
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">🔍</p>
          <p>Keine Lebensmittel gefunden</p>
        </div>
      )}

      {/* Shopping List Tip */}
      <div className="card border border-green-200 bg-green-50">
        <h3 className="font-semibold text-green-800 mb-3">🛒 Die wichtigsten Einkäufe</h3>
        <div className="grid grid-cols-2 gap-2">
          {['🥦 Brokkoli & Blattgemüse', '🫘 Linsen & Kichererbsen', '🥑 Avocados', '🐟 Lachs & Makrele', '🫐 Beeren', '🌰 Walnüsse & Mandeln', '🥚 Eier', '🌿 Zimt & Kurkuma'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-green-700">
              <span>✓</span> <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
