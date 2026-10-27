
interface Props {
  feature: string;
  description?: string;
  onUpgrade: () => void;
}

export function PremiumGate({ feature, description, onUpgrade }: Props) {
  return (
    <div className="relative">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl">👑</span>
        </div>
        <p className="font-bold text-gray-900 mb-1">{feature}</p>
        {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
        <button
          onClick={onUpgrade}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-2 px-6 rounded-xl text-sm transition-all shadow-md"
        >
          Premium freischalten
        </button>
      </div>
      {/* Blurred preview content */}
      <div className="select-none pointer-events-none blur-sm opacity-50">
        <div className="card">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

interface BadgeProps {
  className?: string;
}

export function PremiumBadge({ className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full ${className}`}>
      👑 PREMIUM
    </span>
  );
}

interface LimitBarProps {
  current: number;
  max: number;
  label: string;
  onUpgrade: () => void;
}

export function LimitBar({ current, max, label, onUpgrade }: LimitBarProps) {
  const pct = Math.min((current / max) * 100, 100);
  const isNearLimit = pct >= 80;
  const isAtLimit = current >= max;

  return (
    <div className={`rounded-xl p-3 border ${isAtLimit ? 'bg-red-50 border-red-200' : isNearLimit ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-bold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-700' : 'text-gray-500'}`}>
          {current} / {max}
        </span>
      </div>
      <div className="bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isAtLimit && (
        <button onClick={onUpgrade} className="w-full text-xs font-semibold text-orange-600 hover:text-orange-700">
          👑 Limit erreicht – Premium holen →
        </button>
      )}
    </div>
  );
}

