export interface RiskQuestion {
  id: string;
  question: string;
  options: { label: string; value: number; description?: string }[];
  weight: number;
  info?: string;
}

export const riskQuestions: RiskQuestion[] = [
  {
    id: 'age',
    question: 'Wie alt sind Sie?',
    weight: 1,
    info: 'Das Diabetesrisiko steigt ab 45 Jahren deutlich an.',
    options: [
      { label: 'Unter 40 Jahre', value: 0 },
      { label: '40–49 Jahre', value: 1 },
      { label: '50–59 Jahre', value: 2 },
      { label: '60 Jahre oder älter', value: 3 },
    ],
  },
  {
    id: 'bmi',
    question: 'Wie würden Sie Ihr Körpergewicht einschätzen?',
    weight: 2,
    info: 'Übergewicht ist der stärkste Risikofaktor für Typ-2-Diabetes.',
    options: [
      { label: 'Normalgewicht (BMI < 25)', value: 0, description: 'Weder über- noch untergewichtig' },
      { label: 'Leichtes Übergewicht (BMI 25–30)', value: 1, description: 'Etwas zu viel' },
      { label: 'Deutliches Übergewicht (BMI 30–35)', value: 2, description: 'Adipositas Grad I' },
      { label: 'Starkes Übergewicht (BMI > 35)', value: 3, description: 'Adipositas Grad II/III' },
    ],
  },
  {
    id: 'waist',
    question: 'Wie groß ist Ihr Bauchumfang?',
    weight: 2,
    info: 'Bauchfett (viszerales Fett) ist besonders stoffwechselschädlich.',
    options: [
      { label: 'Normal (Frau < 80cm / Mann < 94cm)', value: 0 },
      { label: 'Erhöht (Frau 80–88cm / Mann 94–102cm)', value: 1 },
      { label: 'Stark erhöht (Frau > 88cm / Mann > 102cm)', value: 2 },
    ],
  },
  {
    id: 'family',
    question: 'Hat jemand in Ihrer Familie Diabetes?',
    weight: 2,
    info: 'Genetische Veranlagung erhöht das Risiko erheblich.',
    options: [
      { label: 'Nein', value: 0 },
      { label: 'Entfernte Verwandte (Onkel, Tante, Großeltern)', value: 1 },
      { label: 'Eltern oder Geschwister', value: 2 },
      { label: 'Eltern UND Geschwister', value: 3 },
    ],
  },
  {
    id: 'activity',
    question: 'Wie aktiv sind Sie körperlich?',
    weight: 1.5,
    info: 'Bewegungsmangel ist ein bedeutender Risikofaktor.',
    options: [
      { label: 'Sehr aktiv (täglich Sport oder körperliche Arbeit)', value: 0 },
      { label: 'Aktiv (3–4x/Woche Bewegung)', value: 0 },
      { label: 'Wenig aktiv (1–2x/Woche)', value: 1 },
      { label: 'Inaktiv (kaum Bewegung)', value: 2 },
    ],
  },
  {
    id: 'diet',
    question: 'Wie würden Sie Ihre Ernährung beschreiben?',
    weight: 1.5,
    info: 'Zuckerreiche und fettreiche Ernährung begünstigt Diabetes.',
    options: [
      { label: 'Sehr gesund (viel Gemüse, wenig Zucker, wenig Fertigprodukte)', value: 0 },
      { label: 'Meistens gesund', value: 1 },
      { label: 'Durchschnittlich (gemischt)', value: 2 },
      { label: 'Viel Zucker, Fast Food, Fertigprodukte', value: 3 },
    ],
  },
  {
    id: 'symptoms',
    question: 'Haben Sie folgende Symptome bemerkt?',
    weight: 2.5,
    info: 'Diese Symptome können auf erhöhten Blutzucker hinweisen.',
    options: [
      { label: 'Keine dieser Symptome', value: 0 },
      { label: '1–2 Symptome gelegentlich', value: 1, description: 'Starker Durst, häufiges Wasserlassen, Müdigkeit' },
      { label: '2–3 Symptome regelmäßig', value: 2 },
      { label: 'Mehrere Symptome häufig (+ Sehprobleme, Wunden heilen schlecht)', value: 3 },
    ],
  },
  {
    id: 'blood_pressure',
    question: 'Haben Sie Bluthochdruck?',
    weight: 1,
    info: 'Bluthochdruck und Diabetes treten oft gemeinsam auf.',
    options: [
      { label: 'Nein, Blutdruck ist normal', value: 0 },
      { label: 'Leicht erhöht / unter Kontrolle', value: 1 },
      { label: 'Ja, mit Medikamenten', value: 2 },
    ],
  },
  {
    id: 'smoking',
    question: 'Rauchen Sie?',
    weight: 0.5,
    info: 'Rauchen erhöht das Diabetesrisiko um 30–40%.',
    options: [
      { label: 'Nein, nie geraucht', value: 0 },
      { label: 'Ex-Raucher', value: 0 },
      { label: 'Gelegentlich', value: 1 },
      { label: 'Regelmäßig (täglich)', value: 2 },
    ],
  },
  {
    id: 'sleep',
    question: 'Wie schlafen Sie im Durchschnitt?',
    weight: 0.5,
    info: 'Chronischer Schlafmangel erhöht Insulinresistenz.',
    options: [
      { label: '7–9 Stunden (optimal)', value: 0 },
      { label: '6–7 Stunden', value: 1 },
      { label: 'Unter 6 Stunden', value: 2 },
    ],
  },
  {
    id: 'gestational',
    question: 'Hatten Sie während einer Schwangerschaft Schwangerschaftsdiabetes? (Nur für Frauen)',
    weight: 2,
    info: 'Schwangerschaftsdiabetes erhöht das spätere Diabetesrisiko um 50%.',
    options: [
      { label: 'Nicht zutreffend / Nein', value: 0 },
      { label: 'Ja', value: 2 },
    ],
  },
  {
    id: 'stress',
    question: 'Wie stark fühlen Sie sich dauerhaft gestresst?',
    weight: 0.5,
    info: 'Chronischer Stress erhöht Kortisol und damit den Blutzucker.',
    options: [
      { label: 'Kaum / selten gestresst', value: 0 },
      { label: 'Manchmal mäßig gestresst', value: 1 },
      { label: 'Häufig stark gestresst', value: 2 },
    ],
  },
];

export function calculateRiskScore(answers: Record<string, number>): {
  score: number;
  maxScore: number;
  percentage: number;
  level: 'low' | 'moderate' | 'high' | 'very_high';
} {
  let score = 0;
  let maxScore = 0;

  riskQuestions.forEach((q) => {
    const maxOption = Math.max(...q.options.map((o) => o.value));
    maxScore += maxOption * q.weight;
    if (answers[q.id] !== undefined) {
      score += answers[q.id] * q.weight;
    }
  });

  const percentage = Math.round((score / maxScore) * 100);

  let level: 'low' | 'moderate' | 'high' | 'very_high';
  if (percentage < 25) level = 'low';
  else if (percentage < 50) level = 'moderate';
  else if (percentage < 75) level = 'high';
  else level = 'very_high';

  return { score, maxScore, percentage, level };
}
