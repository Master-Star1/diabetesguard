import type { ActiveTab, Subscription } from '../types';
import { PREMIUM_ENABLED } from '../config';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: string;
  premiumOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Übersicht', icon: '🏠' },
  { id: 'assessment', label: 'Risikotest', icon: '🔍' },
  { id: 'tracker', label: 'Blutzucker', icon: '📈' },
  { id: 'nutrition', label: 'Ernährung', icon: '🥗' },
  { id: 'foods', label: 'Lebensmittel', icon: '🛒' },
];

interface Props {
  activeTab: ActiveTab;
  subscription: Subscription;
  onTabChange: (tab: ActiveTab) => void;
}

export function Navigation({ activeTab, subscription, onTabChange }: Props) {
  const isPremium = subscription.tier === 'premium';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/90 backdrop-blur-xl border-r border-gray-100 min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-100/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white text-lg shadow-md shadow-green-600/30">
              💙
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight tracking-tight">DiabetesGuard</h1>
              <p className="text-xs text-gray-400">Ihr Gesundheitsbegleiter</p>
            </div>
          </div>
        </div>
        <nav className="p-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-150 text-left ${
                activeTab === item.id
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/25'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {activeTab === item.id && <span className="w-1.5 h-1.5 rounded-full bg-white/80" />}
            </button>
          ))}
        </nav>

        {/* Premium upsell / status in sidebar */}
        {!PREMIUM_ENABLED ? (
          <div className="p-4 pb-0">
            <button
              onClick={() => onTabChange('premium')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                activeTab === 'premium' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-lg">⚙️</span>
              <span>Einstellungen</span>
            </button>
          </div>
        ) : isPremium ? (
          <div
            className="p-4 m-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 cursor-pointer"
            onClick={() => onTabChange('premium')}
          >
            <p className="text-xs font-bold text-yellow-700 mb-0.5">👑 Premium aktiv</p>
            <p className="text-xs text-yellow-600">Alle Funktionen freigeschaltet</p>
          </div>
        ) : (
          <div
            className="p-4 m-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl cursor-pointer hover:from-yellow-500 hover:to-orange-500 transition-all"
            onClick={() => onTabChange('premium')}
          >
            <p className="text-xs font-bold text-white mb-0.5">👑 Premium freischalten</p>
            <p className="text-xs text-white/80">Ab 4,99 €/Monat – alle Limits aufheben</p>
          </div>
        )}

        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400 text-center">⚕️ Kein Ersatz für ärztliche Diagnose</p>
          <p className="text-xs text-gray-400 text-center mt-1">
            <a href={`${import.meta.env.BASE_URL}datenschutz.html`} target="_blank" rel="noreferrer" className="hover:text-gray-600">Datenschutz</a>
            {" · "}
            <a href={`${import.meta.env.BASE_URL}impressum.html`} target="_blank" rel="noreferrer" className="hover:text-gray-600">Impressum</a>
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Nav – Glaseffekt */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-xl border-t border-gray-200/70 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex-1 flex flex-col items-center pt-2 pb-2.5 px-1"
            >
              <span
                className={`text-xl mb-0.5 px-3 py-0.5 rounded-full transition-all duration-200 ${
                  activeTab === item.id ? 'bg-green-100' : ''
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`leading-tight text-center font-medium transition-colors ${
                  activeTab === item.id ? 'text-green-700' : 'text-gray-400'
                }`}
                style={{ fontSize: '10px' }}
              >
                {item.label}
              </span>
            </button>
          ))}
          {/* Premium button in mobile nav */}
          <button
            onClick={() => onTabChange('premium')}
            className="flex-1 flex flex-col items-center pt-2 pb-2.5 px-1"
          >
            <span className={`text-xl mb-0.5 px-3 py-0.5 rounded-full transition-all duration-200 ${activeTab === 'premium' ? (PREMIUM_ENABLED ? 'bg-amber-100' : 'bg-green-100') : ''}`}>{PREMIUM_ENABLED ? '👑' : '⚙️'}</span>
            <span className={`leading-tight text-center font-medium ${activeTab === 'premium' ? (PREMIUM_ENABLED ? 'text-amber-600' : 'text-green-700') : 'text-gray-400'}`} style={{ fontSize: '10px' }}>
              {!PREMIUM_ENABLED ? 'Einstellungen' : isPremium ? 'Premium' : 'Upgrade'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
