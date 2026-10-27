import type { NutritionTip } from '../types';

/**
 * Inhalte für den Schwangerschaftsdiabetes-Modus.
 * Grundlage: S3-Leitlinie Gestationsdiabetes (DDG/DGGG) und Patientinnen-Leitlinie.
 * Bewusst keine Aussagen zu Insulin oder Dosierungen – das gehört in die Praxis.
 */

export const pregnancyTips: NutritionTip[] = [
  { id: 'p1', icon: '🌅', category: 'food', title: 'Das Frühstück ist die kritischste Mahlzeit', content: 'Morgens ist die Insulinresistenz durch Schwangerschaftshormone am höchsten. Halten Sie das Frühstück kohlenhydratarm (ca. 15–30 g KH): Vollkornbrot mit Ei oder Käse statt Müsli mit Obst und Saft.' },
  { id: 'p2', icon: '🍽️', category: 'food', title: 'Kleiner, aber öfter', content: 'Drei Hauptmahlzeiten plus 2–3 kleine Zwischenmahlzeiten verteilen die Kohlenhydrate über den Tag und verhindern Spitzen. Eine späte Kleinigkeit (z. B. Joghurt mit Nüssen) stabilisiert oft den Nüchternwert am Morgen.' },
  { id: 'p3', icon: '🚶‍♀️', category: 'exercise', title: '15 Minuten Gehen nach dem Essen', content: 'Ein kurzer Spaziergang direkt nach der Mahlzeit senkt den 1-Stunden-Wert spürbar – die Muskeln nehmen Zucker auch ohne Insulin auf. Sanfte Bewegung ist in der Schwangerschaft ausdrücklich empfohlen, sofern Ihre Ärztin nichts anderes sagt.' },
  { id: 'p4', icon: '🥗', category: 'food', title: 'Reihenfolge: Gemüse, Eiweiß, dann Kohlenhydrate', content: 'Wer zuerst Gemüse und Eiweiß isst, dämpft den Blutzuckeranstieg um bis zu 40 %. Das gilt besonders für Nudeln, Reis und Kartoffeln.' },
  { id: 'p5', icon: '🥛', category: 'food', title: 'Keine Säfte, keine Smoothies', content: 'Flüssiger Zucker geht am schnellsten ins Blut – auch aus „gesunden" Obstsäften. Wasser, ungesüßter Tee, verdünnte Schorle (1:4). Obst lieber im Ganzen und zur Mahlzeit, nicht allein.' },
  { id: 'p6', icon: '⚖️', category: 'lifestyle', title: 'Keine Diät – Umverteilung', content: 'Abnehmen ist in der Schwangerschaft nicht das Ziel. Es geht nicht um weniger Essen, sondern um weniger schnelle Kohlenhydrate pro Mahlzeit und mehr Eiweiß, Gemüse und gute Fette.' },
  { id: 'p7', icon: '🌾', category: 'food', title: 'Vollkorn und Hülsenfrüchte', content: 'Vollkornbrot, Haferflocken (kernig), Linsen und Bohnen liefern Ballaststoffe, die den Zucker langsam freisetzen. Weißbrot, Toast, weißer Reis und Cornflakes gehören auf die Streichliste.' },
  { id: 'p8', icon: '😴', category: 'lifestyle', title: 'Schlaf beeinflusst den Nüchternwert', content: 'Wenig oder unruhiger Schlaf erhöht Stresshormone und damit den Morgenwert. Wenn der Nüchternwert trotz guter Ernährung hoch bleibt, sprechen Sie das bei Ihrer Diabetologin an – das ist häufig und kein persönliches Versagen.' },
  { id: 'p9', icon: '📝', category: 'monitoring', title: 'Messen und aufschreiben, was Sie gegessen haben', content: 'Tragen Sie zu jedem Nach-Mahlzeit-Wert die Kohlenhydrate ein. Nach zwei Wochen sehen Sie in der Musteranalyse genau, welche Lebensmittel bei Ihnen Spitzen machen – das ist individuell sehr unterschiedlich.' },
  { id: 'p10', icon: '🧘‍♀️', category: 'lifestyle', title: 'Die Diagnose ist keine Schuld', content: 'Schwangerschaftsdiabetes entsteht durch Hormone der Plazenta, nicht durch Fehlverhalten. Mit guter Einstellung verläuft die Schwangerschaft in den allermeisten Fällen völlig normal.' },
  { id: 'p11', icon: '🍫', category: 'food', title: 'Heißhunger auf Süßes', content: 'Ein Stück Bitterschokolade (≥ 70 %), Beeren mit Quark oder eine Handvoll Nüsse befriedigen den Appetit, ohne den Blutzucker hochzujagen. Süßes nie auf leeren Magen, sondern direkt nach einer eiweißreichen Mahlzeit.' },
  { id: 'p12', icon: '🩺', category: 'monitoring', title: 'Werte-Tagebuch zum Termin mitnehmen', content: 'Ihre Diabetologin passt die Empfehlungen an Ihre Werte an. Der PDF-Bericht aus der Statistik zeigt Nüchtern-, 1-h- und 2-h-Werte übersichtlich – das spart Zeit im Gespräch.' },
];

export const pregnancyTargets = [
  { label: 'Nüchtern / vor dem Essen', value: 'unter 95 mg/dL', mmol: 'unter 5,3 mmol/L' },
  { label: '1 Stunde nach dem Essen', value: 'unter 140 mg/dL', mmol: 'unter 7,8 mmol/L' },
  { label: '2 Stunden nach dem Essen', value: 'unter 120 mg/dL', mmol: 'unter 6,7 mmol/L' },
];

export const afterBirthSteps = [
  { icon: '🍼', title: 'Direkt nach der Geburt', text: 'Bei den meisten Frauen normalisiert sich der Blutzucker sofort. Die Messungen können meist beendet werden – Ihre Klinik sagt Ihnen, wann.' },
  { icon: '🤱', title: 'Stillen hilft', text: 'Stillen senkt nachweislich das Risiko, später Typ-2-Diabetes zu entwickeln – für Mutter und Kind.' },
  { icon: '🧪', title: '6–12 Wochen nach der Geburt: Zuckerbelastungstest', text: 'Ein oGTT beim Hausarzt oder Diabetologen ist Kassenleistung und wichtig – etwa 4–8 % haben danach weiterhin erhöhte Werte.' },
  { icon: '🔁', title: 'Alle 1–3 Jahre kontrollieren', text: 'Frauen nach Schwangerschaftsdiabetes haben ein bis zu 50 % erhöhtes Risiko für Typ-2-Diabetes in den nächsten 10 Jahren. Der Risikotest in dieser App erinnert Sie daran – wechseln Sie nach der Geburt einfach ins Standard-Profil.' },
];

export const pregnancyWarningSigns = [
  'Nüchternwerte an 2 Tagen in Folge über 110 mg/dL',
  'Werte nach dem Essen wiederholt über 180 mg/dL',
  'Unterzuckerung unter 60 mg/dL (Zittern, Schwitzen, Verwirrtheit)',
  'Starker Durst, Übelkeit, Sehstörungen oder deutlich weniger Kindsbewegungen',
];

// ─── Produktempfehlungen (Affiliate) ─────────────────────────────────────────
// Links bleiben leer, bis das Partnerprogramm freigeschaltet ist. Solange
// ein Link leer ist, wird das Produkt ohne Kauf-Button angezeigt.
// Kennzeichnungspflicht: jeder Link wird in der App als „Anzeige" markiert.

export interface Product {
  id: string;
  icon: string;
  name: string;
  why: string;
  audience: 'all' | 'pregnancy';
  url: string; // Affiliate-Link, z.B. https://amzn.to/xxxx – leer = noch nicht aktiv
}

export const products: Product[] = [
  { id: 'meter', icon: '🩸', name: 'Blutzuckermessgerät mit Teststreifen-Set', why: 'Das erste Gerät zahlt meist die Kasse – ein Zweitgerät für unterwegs oder das Büro spart das Hin- und Hertragen.', audience: 'all', url: '' },
  { id: 'strips', icon: '🧻', name: 'Teststreifen (Nachfüllpackung)', why: 'Bei 4–7 Messungen täglich reicht die Kassenmenge oft nicht. Vorher prüfen, welche Streifen zu Ihrem Gerät passen.', audience: 'all', url: '' },
  { id: 'lancets', icon: '📍', name: 'Lanzetten & Stechhilfe', why: 'Frische Lanzetten stechen weniger schmerzhaft. Wer oft misst, merkt den Unterschied.', audience: 'all', url: '' },
  { id: 'cookbook_pregnancy', icon: '📖', name: 'Kochbuch: Schwangerschaftsdiabetes', why: 'Rezepte mit Kohlenhydratangaben, die auf die Zielwerte in der Schwangerschaft abgestimmt sind – besonders Frühstücksideen.', audience: 'pregnancy', url: '' },
  { id: 'cookbook', icon: '📚', name: 'Kochbuch: Low-GI-Küche', why: 'Alltagstaugliche Gerichte mit niedrigem glykämischen Index – passt zum Lebensmittelführer der App.', audience: 'all', url: '' },
  { id: 'snacks', icon: '🥜', name: 'Nussmischung ungesalzen', why: 'Der ideale Zwischenmahlzeit-Snack: Eiweiß und gute Fette, kaum Einfluss auf den Blutzucker.', audience: 'all', url: '' },
  { id: 'bp', icon: '💓', name: 'Oberarm-Blutdruckmessgerät', why: 'Blutdruck gehört bei Diabetes und in der Schwangerschaft zur Routinekontrolle – validierte Geräte sind ab ca. 30 € zu haben.', audience: 'all', url: '' },
];
