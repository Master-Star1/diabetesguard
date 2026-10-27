import type { AppSettings, Profile, Subscription } from '../types';
import { PREMIUM_ENABLED } from '../config';
import { DataManagement } from './DataManagement';
import { ProfileSelector } from './ProfileSelector';

interface Props {
  subscription: Subscription;
  settings: AppSettings;
  onProfileChange: (profile: Profile, dueDate: string | null) => void;
  onUpgrade: () => void;
  onDowngrade: () => void; // for testing/demo purposes
}

const features = [
  { icon: '📈', title: 'Unbegrenzte Blutzucker-Einträge', free: '10 Einträge', premium: 'Unbegrenzt' },
  { icon: '📊', title: 'Verlaufsdiagramm', free: '—', premium: '✓ Inklusive' },
  { icon: '🥗', title: 'Alle 20 Ernährungstipps', free: '5 Tipps', premium: 'Alle 20' },
  { icon: '📋', title: 'Vollständiger Mahlzeitenplan', free: '—', premium: '✓ Personalisiert' },
  { icon: '🧪', title: 'HbA1c-Trendanalyse', free: '—', premium: '✓ Inklusive' },
  { icon: '📄', title: 'PDF-Export für den Arzt', free: '—', premium: '✓ Inklusive' },
  { icon: '🔔', title: 'Mess-Erinnerungen', free: '—', premium: '✓ Inklusive' },
  { icon: '🛒', title: 'Vollständiger Lebensmittelführer', free: '20 Lebensmittel', premium: '35+ Lebensmittel' },
];

const plans = [
  {
    id: 'monthly',
    label: 'Monatlich',
    price: '4,99 €',
    period: '/Monat',
    priceId: 'price_monthly_XXX', // replace with real Stripe price ID
    badge: null,
  },
  {
    id: 'yearly',
    label: 'Jährlich',
    price: '39,99 €',
    period: '/Jahr',
    priceId: 'price_yearly_XXX', // replace with real Stripe price ID
    badge: '33% günstiger',
    perMonth: '3,33 €/Monat',
  },
];

export function PremiumPage({ subscription, settings, onProfileChange, onUpgrade, onDowngrade }: Props) {
  const isPremium = subscription.tier === 'premium';

  if (!PREMIUM_ENABLED) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
        <ProfileSelector profile={settings.profile} dueDate={settings.dueDate} onChange={onProfileChange} />
        <DataManagement />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-3xl">👑</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">DiabetesGuard Premium</h2>
        <p className="text-gray-500 text-sm mt-1">Alle Funktionen, keine Limits</p>
      </div>

      {/* Current plan banner */}
      {isPremium ? (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 text-center">
          <p className="font-bold text-yellow-800">✅ Sie haben Premium aktiv</p>
          <p className="text-xs text-yellow-600 mt-1">Aktiv seit: {subscription.startedAt ? new Date(subscription.startedAt).toLocaleDateString('de-DE') : '—'}</p>
          <button onClick={onDowngrade} className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
            Abo kündigen
          </button>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-sm font-semibold text-red-700">Sie nutzen die kostenlose Version</p>
          <p className="text-xs text-red-500 mt-0.5">Viele Funktionen sind eingeschränkt</p>
        </div>
      )}

      {/* Feature comparison */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Funktionsvergleich</h3>
        <div className="space-y-0">
          {/* Header row */}
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-gray-100">
            <div className="col-span-1" />
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400">KOSTENLOS</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-orange-500">PREMIUM</p>
            </div>
          </div>
          {features.map((f) => (
            <div key={f.title} className="grid grid-cols-3 gap-2 py-3 border-b border-gray-50 last:border-0 items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">{f.icon}</span>
                <span className="text-xs text-gray-700 font-medium leading-tight">{f.title}</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-400">{f.free}</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-green-600 font-semibold">{f.premium}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing plans */}
      {!isPremium && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Plan wählen</h3>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 p-4 ${plan.badge ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">{plan.label}</p>
                  {plan.badge && (
                    <span className="bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{plan.price}</p>
                  <p className="text-xs text-gray-400">{plan.period}</p>
                </div>
              </div>
              {'perMonth' in plan && plan.perMonth && (
                <p className="text-xs text-orange-600 font-medium mb-3">Nur {plan.perMonth}</p>
              )}
              <button
                onClick={onUpgrade}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.badge
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white shadow-md'
                    : 'bg-gray-800 hover:bg-gray-900 text-white'
                }`}
              >
                {plan.label} starten →
              </button>
            </div>
          ))}

          {/* Payment info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700">💳 Sichere Zahlung über Stripe</p>
            <div className="flex flex-wrap gap-2">
              {['SEPA-Lastschrift', 'Kreditkarte', 'Apple Pay', 'Google Pay'].map((m) => (
                <span key={m} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Jederzeit kündbar · Keine Mindestlaufzeit · DSGVO-konform
            </p>
          </div>
        </div>
      )}

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: '📱', label: 'Nur auf Ihrem Gerät', sub: 'Keine Cloud, kein Konto' },
          { icon: '🇩🇪', label: 'DSGVO-konform', sub: 'Keine Datenweitergabe' },
          { icon: '↩️', label: 'Kündbar', sub: 'Monatlich' },
        ].map((t) => (
          <div key={t.label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xl mb-1">{t.icon}</p>
            <p className="text-xs font-semibold text-gray-700">{t.label}</p>
            <p className="text-xs text-gray-400">{t.sub}</p>
          </div>
        ))}
      </div>

      {/* Profil: Standard / Schwangerschaft */}
      <ProfileSelector profile={settings.profile} dueDate={settings.dueDate} onChange={onProfileChange} />

      {/* Backup / Wiederherstellung / Löschen – für alle Nutzer */}
      <DataManagement />
    </div>
  );
}
