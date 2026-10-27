import type { BloodSugarEntry, WeightEntry } from '../types';
import { calcPoints, calcStreak, currentLevel, nextLevel, weeklyChallenges } from '../data/gamification';

interface Props {
  entries: BloodSugarEntry[];
  weightEntries: WeightEntry[];
}

export function GamificationCard({ entries, weightEntries }: Props) {
  const points = calcPoints(entries, weightEntries);
  const level = currentLevel(points);
  const next = nextLevel(points);
  const streak = calcStreak(entries);

  const progressPct = next
    ? Math.round(((points - level.minPoints) / (next.minPoints - level.minPoints)) * 100)
    : 100;

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700 rounded-2xl p-5 text-white shadow-lg shadow-purple-600/25">
      <div className="flex items-center gap-4">
        {/* Maskottchen */}
        <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center text-4xl shrink-0">
          {level.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold">{level.title}</p>
            <span className="bg-white/20 text-xs font-semibold px-2 py-0.5 rounded-full">Level {level.level}</span>
          </div>
          <p className="text-xs text-purple-100 mt-0.5 leading-snug">{level.description}</p>
        </div>
      </div>

      {/* Fortschritt zum nächsten Level */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-purple-100 mb-1">
          <span>⭐ {points} Punkte</span>
          {next ? <span>Nächstes Level: {next.minPoints} P.</span> : <span>Max. Level erreicht!</span>}
        </div>
        <div className="bg-white/20 rounded-full h-2">
          <div className="bg-yellow-300 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Streak */}
      <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
        <span className="text-xl">🔥</span>
        <p className="text-sm">
          {streak > 0 ? (
            <><strong>{streak} {streak === 1 ? 'Tag' : 'Tage'}</strong> in Folge gemessen{streak >= 7 ? ' – fantastisch!' : ' – weiter so!'}</>
          ) : (
            <>Messen Sie heute, um Ihren Streak zu starten!</>
          )}
        </p>
      </div>
    </div>
  );
}

export function ChallengesCard({ entries, weightEntries }: Props) {
  const challenges = weeklyChallenges(entries, weightEntries);
  const completed = challenges.filter((c) => c.current >= c.target).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">🏆 Wochen-Challenges</h3>
        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          {completed}/{challenges.length} geschafft
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Jeden Montag geht's von vorn los</p>
      <div className="space-y-3">
        {challenges.map((c) => {
          const done = c.current >= c.target;
          const pct = Math.round((c.current / c.target) * 100);
          return (
            <div key={c.id} className={`rounded-xl p-3 border ${done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{done ? '✅' : c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${done ? 'text-green-700' : 'text-gray-800'}`}>{c.title}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {done ? `+${c.rewardPoints} P.` : `${c.current}/${c.target}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{c.description}</p>
                  {!done && (
                    <div className="bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
