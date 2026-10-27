import type { NutritionTip, Profile } from '../types';
import { pregnancyTips } from './pregnancy';

export const nutritionTips: NutritionTip[] = [
  {
    id: '1',
    title: 'Ballaststoffe sind dein bester Freund',
    content: 'Essen Sie täglich mindestens 30g Ballaststoffe aus Hülsenfrüchten, Gemüse, Nüssen und Vollkornprodukten. Ballaststoffe verlangsamen die Zuckeraufnahme und stabilisieren den Blutzucker.',
    category: 'food',
    icon: '🥦',
  },
  {
    id: '2',
    title: 'Die Teller-Methode',
    content: 'Füllen Sie die Hälfte Ihres Tellers mit nicht-stärkehaltigem Gemüse, ein Viertel mit magerem Protein und ein Viertel mit Vollkornprodukten oder Hülsenfrüchten.',
    category: 'food',
    icon: '🍽️',
  },
  {
    id: '3',
    title: 'Spaziergang nach dem Essen',
    content: 'Ein 10-15 Minuten Spaziergang nach den Mahlzeiten kann den Blutzuckeranstieg um bis zu 30% reduzieren. Die Muskeln nehmen Glukose ohne Insulin auf.',
    category: 'exercise',
    icon: '🚶',
  },
  {
    id: '4',
    title: 'Zuckerfreie Getränke wählen',
    content: 'Ersetzen Sie Säfte, Limonaden und gesüßte Getränke durch Wasser, ungesüßten Kräutertee oder Kaffee ohne Zucker. Flüssigkalorien erhöhen den Blutzucker sehr schnell.',
    category: 'food',
    icon: '💧',
  },
  {
    id: '5',
    title: 'Regelmäßige Mahlzeiten',
    content: 'Essen Sie 3 ausgewogene Mahlzeiten täglich zu ähnlichen Zeiten. Regelmäßige Mahlzeiten helfen, Blutzuckerschwankungen zu minimieren und Heißhunger zu vermeiden.',
    category: 'lifestyle',
    icon: '⏰',
  },
  {
    id: '6',
    title: 'Zimt als natürlicher Helfer',
    content: 'Studien zeigen, dass täglich 1-6g Zimt die Insulinempfindlichkeit verbessern kann. Streuen Sie etwas auf Haferflocken, Joghurt oder in Ihren Kaffee.',
    category: 'food',
    icon: '🌿',
  },
  {
    id: '7',
    title: 'Schlaf ist Medizin',
    content: 'Schlafdeprivation erhöht den Cortisolspiegel und die Insulinresistenz. 7-9 Stunden Schlaf pro Nacht sind entscheidend für eine gute Blutzuckerkontrolle.',
    category: 'lifestyle',
    icon: '😴',
  },
  {
    id: '8',
    title: 'Langsam essen',
    content: 'Kauen Sie jeden Bissen 20-30 Mal. Das langsame Essen fördert bessere Verdauung, gibt dem Körper Zeit, Sättigungshormone auszuschütten und verhindert Überessen.',
    category: 'lifestyle',
    icon: '🍴',
  },
  {
    id: '9',
    title: 'Apfelessig vor dem Essen',
    content: '1-2 EL Apfelessig in Wasser vor einer stärkehaltigen Mahlzeit kann den postprandialen Blutzucker um bis zu 20% senken. Die Essigsäure verlangsamt die Stärkeverdauung.',
    category: 'food',
    icon: '🍎',
  },
  {
    id: '10',
    title: 'Stress reduzieren',
    content: 'Chronischer Stress erhöht Cortisol und Adrenalin, was den Blutzucker steigen lässt. Probieren Sie täglich 10 Minuten Meditation, Yoga oder tiefes Atmen.',
    category: 'lifestyle',
    icon: '🧘',
  },
  {
    id: '11',
    title: 'Krafttraining hilft',
    content: 'Muskeltraining 2-3x pro Woche erhöht dauerhaft die Insulinsensitivität. Muskeln sind der größte Glukoseverbraucher des Körpers.',
    category: 'exercise',
    icon: '💪',
  },
  {
    id: '12',
    title: 'Portion Control bei Kohlenhydraten',
    content: 'Messen Sie Reis, Nudeln und Brot zunächst ab, bis Sie ein Gefühl für die richtige Portionsgröße entwickeln. Eine Portion Reis entspricht etwa einer Faust.',
    category: 'food',
    icon: '📏',
  },
  {
    id: '13',
    title: 'Omega-3 täglich',
    content: 'Fetter Fisch (Lachs, Makrele, Hering) 2x/Woche oder täglich 2g Fischöl verbessern die Insulinempfindlichkeit und schützen das Herz-Kreislauf-System.',
    category: 'food',
    icon: '🐟',
  },
  {
    id: '14',
    title: 'Blutzucker protokollieren',
    content: 'Ein Tagebuch über Blutzuckerwerte, Mahlzeiten und Aktivitäten hilft, persönliche Muster zu erkennen. So können Sie herausfinden, welche Lebensmittel Ihren Blutzucker am meisten beeinflussen.',
    category: 'monitoring',
    icon: '📊',
  },
  {
    id: '15',
    title: 'Wasser vor dem Essen',
    content: 'Trinken Sie 500ml Wasser 30 Minuten vor jeder Mahlzeit. Das füllt den Magen, fördert Sättigung und unterstützt den Stoffwechsel.',
    category: 'lifestyle',
    icon: '🥤',
  },
  {
    id: '16',
    title: 'Hülsenfrüchte täglich',
    content: 'Linsen, Bohnen und Kichererbsen haben einen niedrigen glykämischen Index und sind reich an Eiweiß und Ballaststoffen. Sie stabilisieren den Blutzucker über Stunden.',
    category: 'food',
    icon: '🫘',
  },
  {
    id: '17',
    title: 'Magnesium nicht vergessen',
    content: 'Magnesiumreiche Lebensmittel (Kürbiskerne, Spinat, dunkle Schokolade) verbessern die Insulinrezeptorfunktion. Viele Diabetiker haben einen Magnesiummangel.',
    category: 'food',
    icon: '✨',
  },
  {
    id: '18',
    title: 'Keine Diäten – Lebensstil ändern',
    content: 'Kurzfristige Diäten helfen nicht dauerhaft. Ziel ist eine nachhaltige Ernährungsumstellung, die Sie ein Leben lang beibehalten können und die Ihnen Freude macht.',
    category: 'lifestyle',
    icon: '🌱',
  },
  {
    id: '19',
    title: 'Gemüse zuerst essen',
    content: 'Essen Sie bei einer Mahlzeit zuerst das Gemüse, dann das Protein, dann die Kohlenhydrate. Diese Reihenfolge reduziert den Blutzuckeranstieg um bis zu 40%.',
    category: 'food',
    icon: '🥗',
  },
  {
    id: '20',
    title: 'Alkohol mit Bedacht',
    content: 'Alkohol kann den Blutzucker zunächst senken, dann aber gefährlich ansteigen lassen. Trinken Sie nie auf leeren Magen und maximal 1-2 Einheiten gelegentlich.',
    category: 'lifestyle',
    icon: '⚠️',
  },
];

export const getDailyTip = (profile: Profile = 'standard'): NutritionTip => {
  const pool = profile === 'pregnancy' ? pregnancyTips : nutritionTips;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return pool[dayOfYear % pool.length];
};
