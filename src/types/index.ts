// 'after_meal' = 2 h nach dem Essen (Standard). 'after_meal_1h' gibt es nur im
// Schwangerschafts-Modus, weil dort der 1-h-Wert der wichtigste Zielwert ist.
export type MealContext = 'fasting' | 'before_meal' | 'after_meal' | 'after_meal_1h' | 'bedtime';

/** Welche Zielwerte gelten: Standard (Typ 2/Prädiabetes) oder Schwangerschaftsdiabetes. */
export type Profile = 'standard' | 'pregnancy';

export interface BloodSugarEntry {
  id: string;
  value: number;
  timestamp: string;
  mealContext: MealContext;
  notes?: string;
  carbs?: number; // Kohlenhydrate in Gramm (optional)
  mood?: 'good' | 'neutral' | 'bad';
  tags?: string[]; // z.B. Sport, Stress, Krank
}

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
}

export interface RiskAssessmentResult {
  score: number;
  level: 'low' | 'moderate' | 'high' | 'very_high';
  percentage: number;
  answers: Record<string, number>;
}

export interface NutritionTip {
  id: string;
  title: string;
  content: string;
  category: 'food' | 'lifestyle' | 'monitoring' | 'exercise';
  icon: string;
  dayOfYear?: number;
}

export interface Food {
  name: string;
  glycemicIndex: number;
  category: 'excellent' | 'good' | 'moderate' | 'avoid';
  benefit: string;
  portion: string;
  emoji: string;
}

export interface WeightEntry {
  id: string;
  weight: number; // kg
  timestamp: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string; // z.B. "500 mg", "1 Tablette"
  times: string[]; // "HH:MM", z.B. ["08:00", "20:00"]
  active: boolean;
  createdAt: string;
}

export interface MedIntake {
  id: string;
  medicationId: string;
  date: string; // "YYYY-MM-DD" (lokal)
  time: string; // geplante Uhrzeit "HH:MM"
  status: 'taken' | 'skipped';
  timestamp: string;
}

export type GlucoseUnit = 'mgdl' | 'mmoll';

export interface AppSettings {
  unit: GlucoseUnit;
  heightCm: number | null;
  profile: Profile;
  dueDate: string | null; // Errechneter Geburtstermin (YYYY-MM-DD), nur im Schwangerschafts-Modus
}

// Umrechnung: 1 mmol/L = 18.016 mg/dL. Werte werden immer in mg/dL gespeichert.
export const MMOL_FACTOR = 18.016;

export function toDisplayUnit(mgdl: number, unit: GlucoseUnit): number {
  return unit === 'mmoll' ? Math.round((mgdl / MMOL_FACTOR) * 10) / 10 : mgdl;
}

export function toMgdl(value: number, unit: GlucoseUnit): number {
  return unit === 'mmoll' ? Math.round(value * MMOL_FACTOR) : value;
}

export function unitLabel(unit: GlucoseUnit): string {
  return unit === 'mmoll' ? 'mmol/L' : 'mg/dL';
}

export type ActiveTab = 'dashboard' | 'assessment' | 'tracker' | 'nutrition' | 'foods' | 'premium';

export type PlanTier = 'free' | 'premium';

export interface Subscription {
  tier: PlanTier;
  startedAt: string | null;
  // In production: stripeCustomerId, stripeSubscriptionId, expiresAt would live here
}

export const FREE_LIMITS = {
  maxBloodSugarEntries: 10,
  maxTipsVisible: 5,
  chartAccess: false,
  pdfExport: false,
  mealPlan: false,
  hba1cTrend: false,
  unlimitedFoods: false,
} as const;

export const PREMIUM_FEATURES = {
  maxBloodSugarEntries: Infinity,
  maxTipsVisible: Infinity,
  chartAccess: true,
  pdfExport: true,
  mealPlan: true,
  hba1cTrend: true,
  unlimitedFoods: true,
} as const;
