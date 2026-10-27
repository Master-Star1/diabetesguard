import type { BloodSugarEntry, WeightEntry } from '../types';

// ─── Punkte ──────────────────────────────────────────────────────────────────
// Punkte werden komplett aus den vorhandenen Daten berechnet (kein separater
// Zustand, der auseinanderlaufen kann).

export const POINTS = {
  measurement: 10,
  withNotes: 3,
  withCarbs: 5,
  withMood: 2,
  weightEntry: 15,
} as const;

export function calcPoints(entries: BloodSugarEntry[], weights: WeightEntry[]): number {
  let pts = 0;
  for (const e of entries) {
    pts += POINTS.measurement;
    if (e.notes) pts += POINTS.withNotes;
    if (e.carbs !== undefined) pts += POINTS.withCarbs;
    if (e.mood) pts += POINTS.withMood;
  }
  pts += weights.length * POINTS.weightEntry;
  return pts;
}

// ─── Level / Maskottchen ─────────────────────────────────────────────────────
// "Zucki", das Zucker-Monster: Je mehr Sie protokollieren, desto zahmer wird es.

export interface Level {
  level: number;
  title: string;
  emoji: string;
  minPoints: number;
  description: string;
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Wildes Zucki', emoji: '👾', minPoints: 0, description: 'Zucki ist noch völlig außer Kontrolle. Fangen Sie an zu messen!' },
  { level: 2, title: 'Neugieriges Zucki', emoji: '🐙', minPoints: 100, description: 'Zucki merkt, dass Sie es beobachten. Weiter so!' },
  { level: 3, title: 'Ruhigeres Zucki', emoji: '🦑', minPoints: 300, description: 'Zucki wird langsam handzahm. Ihre Routine wirkt.' },
  { level: 4, title: 'Braves Zucki', emoji: '🐢', minPoints: 700, description: 'Zucki frisst Ihnen aus der Hand. Beeindruckende Disziplin!' },
  { level: 5, title: 'Gezähmtes Zucki', emoji: '🦥', minPoints: 1500, description: 'Zucki ist gezähmt. Sie sind Meister Ihrer Daten!' },
];

export function currentLevel(points: number): Level {
  let lvl = LEVELS[0];
  for (const l of LEVELS) {
    if (points >= l.minPoints) lvl = l;
  }
  return lvl;
}

export function nextLevel(points: number): Level | null {
  return LEVELS.find((l) => l.minPoints > points) ?? null;
}

// ─── Streak ──────────────────────────────────────────────────────────────────
// Anzahl aufeinanderfolgender Tage (bis heute bzw. gestern) mit ≥1 Messung.

export function calcStreak(entries: BloodSugarEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(
    entries.map((e) => new Date(e.timestamp).toDateString())
  );
  let streak = 0;
  const cursor = new Date();
  // Heute zählt, wenn gemessen wurde; sonst darf der Streak gestern enden.
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ─── Wöchentliche Challenges ─────────────────────────────────────────────────

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  rewardPoints: number;
}

function startOfWeek(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 = Sonntag
  const diff = day === 0 ? 6 : day - 1; // Montag als Wochenstart
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weeklyChallenges(entries: BloodSugarEntry[], weights: WeightEntry[]): Challenge[] {
  const weekStart = startOfWeek().getTime();
  const thisWeek = entries.filter((e) => new Date(e.timestamp).getTime() >= weekStart);
  const weightsThisWeek = weights.filter((w) => new Date(w.timestamp).getTime() >= weekStart);

  const daysMeasured = new Set(thisWeek.map((e) => new Date(e.timestamp).toDateString())).size;
  const afterMeal = thisWeek.filter((e) => e.mealContext === 'after_meal').length;
  const fasting = thisWeek.filter((e) => e.mealContext === 'fasting').length;
  const withDetails = thisWeek.filter((e) => e.carbs !== undefined || e.mood || e.notes).length;

  return [
    {
      id: 'days',
      title: 'Dranbleiben',
      description: 'An 5 verschiedenen Tagen dieser Woche messen',
      icon: '📅',
      target: 5,
      current: Math.min(daysMeasured, 5),
      rewardPoints: 50,
    },
    {
      id: 'after_meal',
      title: 'Mahlzeiten-Detektiv',
      description: '3× nach einer Mahlzeit messen – so erkennen Sie, welches Essen Ihren Blutzucker treibt',
      icon: '🍽️',
      target: 3,
      current: Math.min(afterMeal, 3),
      rewardPoints: 30,
    },
    {
      id: 'fasting',
      title: 'Früher Vogel',
      description: '3× nüchtern am Morgen messen – der wichtigste Vergleichswert',
      icon: '🌅',
      target: 3,
      current: Math.min(fasting, 3),
      rewardPoints: 30,
    },
    {
      id: 'details',
      title: 'Kontext zählt',
      description: 'Bei 3 Messungen Details erfassen (KH, Stimmung oder Notiz)',
      icon: '🏷️',
      target: 3,
      current: Math.min(withDetails, 3),
      rewardPoints: 25,
    },
    {
      id: 'weight',
      title: 'Wiegetag',
      description: '1× diese Woche das Gewicht eintragen',
      icon: '⚖️',
      target: 1,
      current: Math.min(weightsThisWeek.length, 1),
      rewardPoints: 20,
    },
  ];
}
