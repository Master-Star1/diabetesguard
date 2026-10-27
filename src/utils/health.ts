import type { AppSettings, BloodSugarEntry, MealContext, MedIntake, Medication, Profile, RiskAssessmentResult, Subscription, WeightEntry } from '../types';

// ─── Blutzucker-Bewertung (eine Quelle für Dashboard und Tracker) ────────────

export interface GlucoseStatus {
  label: string;
  color: string;
  bg: string;
}

interface Thresholds { warning: number; danger: number }

// Standard (Typ 2 / Prädiabetes): DDG-Praxisempfehlungen
const STANDARD_THRESHOLDS: Record<MealContext, Thresholds> = {
  fasting: { warning: 100, danger: 126 },
  before_meal: { warning: 100, danger: 126 },
  after_meal_1h: { warning: 160, danger: 200 },
  after_meal: { warning: 140, danger: 200 },
  bedtime: { warning: 120, danger: 160 },
};

// Schwangerschaftsdiabetes: S3-Leitlinie DDG/DGGG – nüchtern < 95, 1 h < 140, 2 h < 120 mg/dL
const PREGNANCY_THRESHOLDS: Record<MealContext, Thresholds> = {
  fasting: { warning: 95, danger: 110 },
  before_meal: { warning: 95, danger: 110 },
  after_meal_1h: { warning: 140, danger: 180 },
  after_meal: { warning: 120, danger: 160 },
  bedtime: { warning: 95, danger: 120 },
};

export function thresholdsFor(profile: Profile): Record<MealContext, Thresholds> {
  return profile === 'pregnancy' ? PREGNANCY_THRESHOLDS : STANDARD_THRESHOLDS;
}

export function getGlucoseStatus(mgdl: number, context: string, profile: Profile = 'standard'): GlucoseStatus {
  const t = thresholdsFor(profile)[context as MealContext];
  if (!t) return { label: 'Unbekannt', color: 'text-gray-500', bg: 'bg-gray-100' };
  if (mgdl < 70) return { label: 'Zu niedrig', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (mgdl < t.warning) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
  if (mgdl < t.danger) return { label: 'Erhöht', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  return { label: 'Zu hoch', color: 'text-red-600', bg: 'bg-red-100' };
}

/** Zeit im Zielbereich: Standard 70–180 (internationaler Konsens), Schwangerschaft 63–140. */
export function tirRange(profile: Profile): [number, number] {
  return profile === 'pregnancy' ? [63, 140] : [70, 180];
}

export function contextLabel(context: string, profile: Profile = 'standard'): string {
  const labels: Record<MealContext, string> = {
    fasting: 'Nüchtern',
    before_meal: 'Vor Mahlzeit',
    after_meal_1h: '1 h nach Mahlzeit',
    after_meal: profile === 'pregnancy' ? '2 h nach Mahlzeit' : 'Nach Mahlzeit',
    bedtime: 'Schlafenszeit',
  };
  return labels[context as MealContext] ?? context;
}

/** Referenzbereich als Text, z.B. "70–100 mg/dL" oder "3,9–5,6 mmol/L". */
export function normalRangeText(context: MealContext, profile: Profile, unit: 'mgdl' | 'mmoll'): string {
  const t = thresholdsFor(profile)[context];
  const low = context === 'fasting' || context === 'before_meal' ? 70 : null;
  const fmt = (v: number) => unit === 'mmoll' ? String(Math.round((v / 18.016) * 10) / 10).replace('.', ',') : String(v);
  const u = unit === 'mmoll' ? 'mmol/L' : 'mg/dL';
  return low !== null ? `${fmt(low)}–${fmt(t.warning - 1)} ${u}` : `unter ${fmt(t.warning)} ${u}`;
}

/** Schwangerschaftswoche aus dem errechneten Termin (ET = 40+0). */
export function pregnancyWeek(dueDate: string | null): { week: number; day: number; daysLeft: number } | null {
  if (!dueDate) return null;
  const et = new Date(dueDate + 'T00:00:00');
  if (Number.isNaN(et.getTime())) return null;
  const daysLeft = Math.round((et.getTime() - Date.now()) / 86400000);
  const elapsed = 280 - daysLeft;
  if (elapsed < 0 || elapsed > 320) return null;
  return { week: Math.floor(elapsed / 7), day: elapsed % 7, daysLeft };
}

// ─── Eindeutige IDs ──────────────────────────────────────────────────────────
// Date.now() kann bei zwei Einträgen in derselben Millisekunde kollidieren.

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Validierung gespeicherter Daten ─────────────────────────────────────────
// localStorage kann von Nutzern, Browser-Extensions oder älteren App-Versionen
// verändert worden sein. Ungültige Einträge werden verworfen statt die App zu
// crashen; gültige bleiben erhalten.

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isNum = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const isStr = (v: unknown, max = 500): v is string => typeof v === 'string' && v.length <= max;
const isDate = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const isDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

const MEAL_CONTEXTS = ['fasting', 'before_meal', 'after_meal', 'after_meal_1h', 'bedtime'] as const;
const MOODS = ['good', 'neutral', 'bad'] as const;

export function validateBloodSugarEntries(raw: unknown): BloodSugarEntry[] | null {
  if (!Array.isArray(raw)) return null;
  const out: BloodSugarEntry[] = [];
  for (const e of raw) {
    if (!isObj(e)) continue;
    if (!isStr(e.id, 64) || !isNum(e.value, 20, 700) || !isDate(e.timestamp)) continue;
    if (!MEAL_CONTEXTS.includes(e.mealContext as never)) continue;
    const entry: BloodSugarEntry = {
      id: e.id,
      value: e.value,
      timestamp: e.timestamp,
      mealContext: e.mealContext as BloodSugarEntry['mealContext'],
    };
    if (isStr(e.notes)) entry.notes = e.notes;
    if (isNum(e.carbs, 0, 500)) entry.carbs = e.carbs;
    if (MOODS.includes(e.mood as never)) entry.mood = e.mood as BloodSugarEntry['mood'];
    if (Array.isArray(e.tags)) entry.tags = e.tags.filter((t): t is string => isStr(t, 40)).slice(0, 10);
    out.push(entry);
  }
  return out;
}

export function validateWeightEntries(raw: unknown): WeightEntry[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter(isObj)
    .filter((e) => isStr(e.id, 64) && isNum(e.weight, 20, 400) && isDate(e.timestamp))
    .map((e) => ({ id: e.id as string, weight: e.weight as number, timestamp: e.timestamp as string }));
}

export function validateSettings(raw: unknown): AppSettings | null {
  if (!isObj(raw)) return null;
  return {
    unit: raw.unit === 'mmoll' ? 'mmoll' : 'mgdl',
    heightCm: isNum(raw.heightCm, 100, 230) ? raw.heightCm : null,
    profile: raw.profile === 'pregnancy' ? 'pregnancy' : 'standard',
    dueDate: isDay(raw.dueDate) ? raw.dueDate : null,
  };
}

export function validateSubscription(raw: unknown): Subscription | null {
  if (!isObj(raw)) return null;
  return {
    tier: raw.tier === 'premium' ? 'premium' : 'free',
    startedAt: isDate(raw.startedAt) ? raw.startedAt : null,
  };
}

export function validateAssessment(raw: unknown): RiskAssessmentResult | null {
  if (!isObj(raw)) return null;
  const levels = ['low', 'moderate', 'high', 'very_high'];
  if (!isNum(raw.score, 0, 1000) || !isNum(raw.percentage, 0, 100)) return null;
  if (!levels.includes(raw.level as string) || !isObj(raw.answers)) return null;
  return {
    score: raw.score,
    percentage: raw.percentage,
    level: raw.level as RiskAssessmentResult['level'],
    answers: raw.answers as Record<string, number>,
  };
}

const isTime = (v: unknown): v is string => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export function validateMedications(raw: unknown): Medication[] | null {
  if (!Array.isArray(raw)) return null;
  const out: Medication[] = [];
  for (const m of raw) {
    if (!isObj(m) || !isStr(m.id, 64) || !isStr(m.name, 80) || !m.name.trim()) continue;
    if (!Array.isArray(m.times)) continue;
    out.push({
      id: m.id,
      name: m.name,
      dose: isStr(m.dose, 80) ? m.dose : '',
      times: m.times.filter(isTime).slice(0, 6),
      active: m.active !== false,
      createdAt: isDate(m.createdAt) ? m.createdAt : new Date().toISOString(),
    });
  }
  return out;
}

export function validateIntakes(raw: unknown): MedIntake[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter(isObj)
    .filter((i) => isStr(i.id, 64) && isStr(i.medicationId, 64) && isDay(i.date) && isTime(i.time)
      && (i.status === 'taken' || i.status === 'skipped') && isDate(i.timestamp))
    .map((i) => ({
      id: i.id as string,
      medicationId: i.medicationId as string,
      date: i.date as string,
      time: i.time as string,
      status: i.status as MedIntake['status'],
      timestamp: i.timestamp as string,
    }));
}

/** Lokales Datum als "YYYY-MM-DD" (nicht UTC – sonst kippt der Tag um 1 Uhr nachts). */
export function localDay(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
