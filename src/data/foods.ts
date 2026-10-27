import type { Food } from '../types';

export const foods: Food[] = [
  // Excellent - GI < 40
  { name: 'Brokkoli', glycemicIndex: 10, category: 'excellent', benefit: 'Senkt Blutzucker, reich an Chrom', portion: 'Unbegrenzt', emoji: '🥦' },
  { name: 'Blattgemüse (Spinat, Grünkohl)', glycemicIndex: 10, category: 'excellent', benefit: 'Magnesium, Antioxidantien, kaum Kalorien', portion: 'Unbegrenzt', emoji: '🥬' },
  { name: 'Avocado', glycemicIndex: 10, category: 'excellent', benefit: 'Gesunde Fette, senkt Blutzucker nach Mahlzeiten', portion: '½ Avocado/Tag', emoji: '🥑' },
  { name: 'Walnüsse', glycemicIndex: 15, category: 'excellent', benefit: 'Omega-3, verbessert Insulinempfindlichkeit', portion: 'Kleine Handvoll (30g)', emoji: '🫘' },
  { name: 'Mandeln', glycemicIndex: 0, category: 'excellent', benefit: 'Senkt postprandialen Blutzucker, reich an Magnesium', portion: '20 Stück/Tag', emoji: '🌰' },
  { name: 'Linsen', glycemicIndex: 32, category: 'excellent', benefit: 'Ballaststoffe, Protein, niedrig GI', portion: '150g gekocht', emoji: '🫘' },
  { name: 'Kichererbsen', glycemicIndex: 28, category: 'excellent', benefit: 'Stabilisiert Blutzucker, sättigend', portion: '150g gekocht', emoji: '🫘' },
  { name: 'Lachs', glycemicIndex: 0, category: 'excellent', benefit: 'Omega-3, Protein, entzündungshemmend', portion: '150-200g', emoji: '🐟' },
  { name: 'Hering/Makrele', glycemicIndex: 0, category: 'excellent', benefit: 'Omega-3, günstig und sehr gesund', portion: '150g', emoji: '🐟' },
  { name: 'Eier', glycemicIndex: 0, category: 'excellent', benefit: 'Hochwertiges Protein, kein Blutzuckereffekt', portion: '1-2 Stück/Tag', emoji: '🥚' },
  { name: 'Beeren (Heidelbeeren, Erdbeeren)', glycemicIndex: 25, category: 'excellent', benefit: 'Antioxidantien, wenig Zucker, verbessert Insulinempfindlichkeit', portion: '150g/Tag', emoji: '🫐' },
  { name: 'Zimt', glycemicIndex: 5, category: 'excellent', benefit: 'Verbessert Insulinsensitivität', portion: '1 TL/Tag', emoji: '🌿' },
  { name: 'Kurkuma', glycemicIndex: 0, category: 'excellent', benefit: 'Curcumin reduziert Insulinresistenz', portion: '1 TL/Tag mit Pfeffer', emoji: '🌿' },
  { name: 'Naturjoghurt (3,5%)', glycemicIndex: 17, category: 'excellent', benefit: 'Probiotika, Protein, niedrig GI', portion: '200g/Tag', emoji: '🥛' },
  { name: 'Hüttenkäse', glycemicIndex: 10, category: 'excellent', benefit: 'Viel Protein, wenig Kohlenhydrate', portion: '200g', emoji: '🧀' },
  { name: 'Knoblauch', glycemicIndex: 10, category: 'excellent', benefit: 'Allicin senkt Blutzucker und Cholesterin', portion: 'Täglich 1-2 Zehen', emoji: '🧄' },
  { name: 'Zwiebeln', glycemicIndex: 10, category: 'excellent', benefit: 'Quercetin verbessert Insulinsekretion', portion: 'Regelmäßig', emoji: '🧅' },
  { name: 'Bitterschokolade (85%+)', glycemicIndex: 22, category: 'excellent', benefit: 'Flavonoide, verbessert Insulinsensitivität', portion: '2-3 Stücke/Tag', emoji: '🍫' },

  // Good - GI 40-55
  { name: 'Haferflockeen (kernig)', glycemicIndex: 55, category: 'good', benefit: 'Beta-Glucan senkt Cholesterin und Blutzucker', portion: '50g trocken', emoji: '🌾' },
  { name: 'Süßkartoffel', glycemicIndex: 44, category: 'good', benefit: 'Mehr Nährstoffe als normale Kartoffel, Ballaststoffe', portion: '150g', emoji: '🍠' },
  { name: 'Vollkornbrot', glycemicIndex: 50, category: 'good', benefit: 'Ballaststoffe, langsamer Blutzuckeranstieg', portion: '1-2 Scheiben', emoji: '🍞' },
  { name: 'Basmati-Reis (gekühlt)', glycemicIndex: 45, category: 'good', benefit: 'Resistente Stärke nach dem Abkühlen', portion: '100g', emoji: '🍚' },
  { name: 'Quinoa', glycemicIndex: 53, category: 'good', benefit: 'Vollständiges Protein, Ballaststoffe', portion: '100g gekocht', emoji: '🌾' },
  { name: 'Äpfel', glycemicIndex: 38, category: 'good', benefit: 'Pektin, Antioxidantien, Quercetin', portion: '1 mittelgroßer Apfel', emoji: '🍎' },
  { name: 'Karotten (roh)', glycemicIndex: 35, category: 'good', benefit: 'Beta-Carotin, Ballaststoffe', portion: '1-2 Stück', emoji: '🥕' },
  { name: 'Tomaten', glycemicIndex: 15, category: 'good', benefit: 'Lycopin, Chrom, reguliert Blutzucker', portion: 'Regelmäßig', emoji: '🍅' },

  // Moderate - GI 56-70
  { name: 'Vollkornnudeln (al dente)', glycemicIndex: 45, category: 'moderate', benefit: 'Besser als normale Nudeln, al dente essen', portion: 'Max. 80g trocken', emoji: '🍝' },
  { name: 'Banane (unreif)', glycemicIndex: 51, category: 'moderate', benefit: 'Kalium, resistente Stärke wenn unreif', portion: '½ Banane', emoji: '🍌' },
  { name: 'Ananas', glycemicIndex: 59, category: 'moderate', benefit: 'Bromelain, Enzyme – in Maßen', portion: '100g', emoji: '🍍' },
  { name: 'Honig', glycemicIndex: 58, category: 'moderate', benefit: 'Besser als Zucker, aber trotzdem sparsam verwenden', portion: 'Max. 1 TL', emoji: '🍯' },

  // Avoid
  { name: 'Weißbrot / Toast', glycemicIndex: 75, category: 'avoid', benefit: 'Kein Nährwert, schneller Blutzuckeranstieg', portion: 'Vermeiden', emoji: '🚫' },
  { name: 'Zucker / Zuckerwaren', glycemicIndex: 68, category: 'avoid', benefit: 'Leere Kalorien, starker Blutzuckeranstieg', portion: 'Meiden', emoji: '🍬' },
  { name: 'Fruchtsäfte (industriell)', glycemicIndex: 70, category: 'avoid', benefit: 'Hoher Fruchtzucker, keine Ballaststoffe', portion: 'Meiden', emoji: '🧃' },
  { name: 'Weißer Reis', glycemicIndex: 72, category: 'avoid', benefit: 'Schnelle Stärke ohne Ballaststoffe', portion: 'Stark reduzieren', emoji: '⚠️' },
  { name: 'Kartoffelchips / Fast Food', glycemicIndex: 75, category: 'avoid', benefit: 'Transfette, Salz, hoher GI', portion: 'Meiden', emoji: '🚫' },
  { name: 'Limonaden / Energy Drinks', glycemicIndex: 68, category: 'avoid', benefit: 'Extreme Zuckerbombe', portion: 'Komplett meiden', emoji: '🚫' },
  { name: 'Weißer Zucker (versteckt)', glycemicIndex: 68, category: 'avoid', benefit: 'In Fertigprodukten, Soßen, Joghurt – immer Etiketten lesen!', portion: 'Meiden', emoji: '⚠️' },
];
