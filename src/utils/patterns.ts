import type { BloodSugarEntry, Profile } from '../types';
import { contextLabel, thresholdsFor, tirRange } from './health';

/**
 * Regelbasierte Musteranalyse – rein beschreibend, keine Therapieempfehlung.
 * Macht sichtbar, wovon der eigene Blutzucker abhängt (Tageszeit, Wochentag,
 * Mahlzeiten, Tags wie Sport/Stress). Alles lokal berechnet.
 */

export interface Insight {
  id: string;
  icon: string;
  title: string;
  text: string;
  severity: 'good' | 'info' | 'warn';
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const r = (n: number) => Math.round(n);

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const CONTEXT_KEYS = ['fasting', 'before_meal', 'after_meal_1h', 'after_meal', 'bedtime'] as const;

export function analyzePatterns(all: BloodSugarEntry[], profile: Profile = 'standard'): Insight[] {
  const th = thresholdsFor(profile);
  const [tirLow, tirHigh] = tirRange(profile);
  const cutoff = Date.now() - 30 * 86400000;
  const entries = all.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
  const insights: Insight[] = [];
  if (entries.length < 5) return insights;

  const values = entries.map((e) => e.value);
  const overall = avg(values)!;

  // 1. Unterzuckerungen – immer zuerst, weil sicherheitsrelevant
  const hypos = entries.filter((e) => e.value < 70).length;
  if (hypos > 0) {
    insights.push({
      id: 'hypo', icon: '🔻', severity: 'warn',
      title: `${hypos}× Unterzuckerung in 30 Tagen`,
      text: 'Werte unter 70 mg/dL sollten Sie mit Ihrem Arzt besprechen – besonders wenn sie nachts oder nach Sport auftreten.',
    });
  }

  // 2. Nach-Mahlzeit-Werte über Ziel
  const after = entries.filter((e) => e.mealContext === 'after_meal' || e.mealContext === 'after_meal_1h');
  if (after.length >= 3) {
    const over = after.filter((e) => e.value >= th[e.mealContext].warning).length;
    const pct = r((over / after.length) * 100);
    if (pct >= 50) {
      insights.push({
        id: 'after_meal_high', icon: '🍽️', severity: 'warn',
        title: `${pct} % der Nach-Mahlzeit-Werte über dem Ziel`,
        text: `Ø ${r(avg(after.map((e) => e.value))!)} mg/dL nach dem Essen. Tipp: erst Gemüse, dann Protein, dann Kohlenhydrate – und ein 10-Minuten-Spaziergang danach.`,
      });
    } else if (pct <= 20) {
      insights.push({
        id: 'after_meal_good', icon: '🍽️', severity: 'good',
        title: 'Mahlzeiten gut im Griff',
        text: `Nur ${pct} % Ihrer Nach-Mahlzeit-Werte liegen über dem Zielwert. Das spricht für eine gute Auswahl und Portionierung.`,
      });
    }
  }

  // 3. Nüchtern-Trend (letzte 7 Tage vs. 7 Tage davor)
  const fasting = entries.filter((e) => e.mealContext === 'fasting');
  const now = Date.now();
  const recentF = fasting.filter((e) => new Date(e.timestamp).getTime() >= now - 7 * 86400000);
  const priorF = fasting.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t < now - 7 * 86400000 && t >= now - 14 * 86400000;
  });
  if (recentF.length >= 3 && priorF.length >= 3) {
    const a = avg(recentF.map((e) => e.value))!;
    const b = avg(priorF.map((e) => e.value))!;
    const diff = a - b;
    if (diff <= -8) {
      insights.push({
        id: 'fasting_down', icon: '📉', severity: 'good',
        title: `Nüchternwerte ${r(Math.abs(diff))} mg/dL gesunken`,
        text: `Ø ${r(a)} statt ${r(b)} mg/dL in der Vorwoche. Was auch immer Sie verändert haben – es wirkt.`,
      });
    } else if (diff >= 8) {
      insights.push({
        id: 'fasting_up', icon: '📈', severity: 'warn',
        title: `Nüchternwerte ${r(diff)} mg/dL gestiegen`,
        text: profile === 'pregnancy'
          ? `Ø ${r(a)} statt ${r(b)} mg/dL in der Vorwoche. In der Schwangerschaft steigt die Insulinresistenz von Woche zu Woche – bitte beim nächsten Termin ansprechen.`
          : `Ø ${r(a)} statt ${r(b)} mg/dL in der Vorwoche. Häufige Auslöser: spätes Essen, wenig Schlaf, Stress oder ein Infekt.`,
      });
    }
  }

  // 4. Wochentag-Muster
  const byDay = new Map<number, number[]>();
  for (const e of entries) {
    const d = new Date(e.timestamp).getDay();
    byDay.set(d, [...(byDay.get(d) ?? []), e.value]);
  }
  let worstDay: { day: number; avg: number } | null = null;
  for (const [day, vals] of byDay) {
    if (vals.length < 3) continue;
    const a = avg(vals)!;
    if (a > overall * 1.12 && (!worstDay || a > worstDay.avg)) worstDay = { day, avg: a };
  }
  if (worstDay) {
    insights.push({
      id: 'weekday', icon: '📅', severity: 'info',
      title: `${WEEKDAYS[worstDay.day]}s liegen höher`,
      text: `Ø ${r(worstDay.avg)} mg/dL gegenüber ${r(overall)} mg/dL im Gesamtschnitt. Gibt es an diesem Tag eine feste Routine (Essen gehen, Besuch, weniger Bewegung)?`,
    });
  }

  // Vergleich nur innerhalb desselben Messzeitpunkts, sonst würde z.B. ein
  // Tag, der zufällig nur bei Nüchternwerten vorkommt, fälschlich als
  // „senkend" erscheinen. Gewichtetes Mittel der Kontext-Differenzen.
  const pairedDiff = (isA: (e: BloodSugarEntry) => boolean, isB: (e: BloodSugarEntry) => boolean) => {
    let weighted = 0, weightSum = 0, nA = 0;
    for (const c of CONTEXT_KEYS) {
      const a = entries.filter((e) => e.mealContext === c && isA(e)).map((e) => e.value);
      const b = entries.filter((e) => e.mealContext === c && isB(e)).map((e) => e.value);
      if (a.length < 2 || b.length < 2) continue;
      const w = Math.min(a.length, b.length);
      weighted += (avg(a)! - avg(b)!) * w;
      weightSum += w;
      nA += a.length;
    }
    return weightSum > 0 && nA >= 3 ? weighted / weightSum : null;
  };

  // 5. Tags: Sport, Stress, Krank, …
  const tagSet = new Set(entries.flatMap((e) => e.tags ?? []));
  for (const tag of tagSet) {
    const diff = pairedDiff((e) => !!e.tags?.includes(tag), (e) => !e.tags?.includes(tag));
    if (diff === null || Math.abs(diff) < 10) continue;
    const lower = diff < 0;
    insights.push({
      id: `tag_${tag}`, icon: '🏷️',
      severity: lower ? 'good' : 'info',
      title: `„${tag}": ${lower ? '' : '+'}${r(diff)} mg/dL im Schnitt`,
      text: lower
        ? `An Tagen mit „${tag}" liegen Ihre Werte im Schnitt ${r(Math.abs(diff))} mg/dL niedriger. Ein Muster, das sich lohnt beizubehalten.`
        : `An Tagen mit „${tag}" liegen Ihre Werte im Schnitt ${r(diff)} mg/dL höher. Das ist ein typischer Zusammenhang – gut zu wissen für die Planung.`,
    });
  }

  // 6. Stimmung
  {
    const diff = pairedDiff((e) => e.mood === 'bad', (e) => e.mood === 'good');
    if (diff !== null && diff >= 12) {
      insights.push({
        id: 'mood', icon: '😞', severity: 'info',
        title: 'Schlechte Stimmung, höhere Werte',
        text: `Bei schlechter Stimmung liegen Ihre Werte Ø ${r(diff)} mg/dL höher. Stresshormone treiben den Blutzucker – Entspannung ist auch Diabetes-Therapie.`,
      });
    }
  }

  // 7. Kohlenhydrate
  const withCarbs = entries.filter((e) => e.carbs !== undefined && e.mealContext === 'after_meal');
  const highC = withCarbs.filter((e) => e.carbs! >= 60).map((e) => e.value);
  const lowC = withCarbs.filter((e) => e.carbs! < 40).map((e) => e.value);
  if (highC.length >= 3 && lowC.length >= 3) {
    const diff = avg(highC)! - avg(lowC)!;
    if (diff >= 15) {
      insights.push({
        id: 'carbs', icon: '🍞', severity: 'info',
        title: `Große KH-Portionen: +${r(diff)} mg/dL`,
        text: `Mahlzeiten mit ≥ 60 g Kohlenhydraten führen bei Ihnen zu Ø ${r(avg(highC)!)} mg/dL, kleinere (< 40 g) zu Ø ${r(avg(lowC)!)} mg/dL.`,
      });
    }
  }

  // 8. Welcher Messzeitpunkt ist am auffälligsten?
  const ctxAvgs = [...CONTEXT_KEYS]
    .map((c) => ({ c, vals: entries.filter((e) => e.mealContext === c).map((e) => e.value) }))
    .filter((x) => x.vals.length >= 3)
    .map((x) => ({ c: x.c, a: avg(x.vals)! }));
  if (ctxAvgs.length >= 2) {
    const top = ctxAvgs.reduce((m, x) => (x.a > m.a ? x : m));
    const bottom = ctxAvgs.reduce((m, x) => (x.a < m.a ? x : m));
    if (top.a - bottom.a >= 25) {
      insights.push({
        id: 'context_spread', icon: '⏱️', severity: 'info',
        title: `Größter Unterschied: ${contextLabel(top.c, profile)} vs. ${contextLabel(bottom.c, profile)}`,
        text: `${contextLabel(top.c, profile)} Ø ${r(top.a)} mg/dL, ${contextLabel(bottom.c, profile)} Ø ${r(bottom.a)} mg/dL. Dort liegt der größte Hebel.`,
      });
    }
  }

  // 9. Lob, wenn alles im Rahmen
  const tir = entries.filter((e) => e.value >= tirLow && e.value <= tirHigh).length / entries.length;
  if (tir >= 0.7 && hypos === 0) {
    insights.push({
      id: 'tir_good', icon: '🎯', severity: 'good',
      title: `${r(tir * 100)} % im Zielbereich`,
      text: 'Über 70 % gilt international als sehr gute Einstellung. Weiter so!',
    });
  }

  // Warnungen zuerst, dann Erkenntnisse, dann Lob
  const order = { warn: 0, info: 1, good: 2 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 6);
}
