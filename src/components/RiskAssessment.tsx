import { useState } from 'react';
import { riskQuestions, calculateRiskScore } from '../data/riskQuestions';
import type { RiskAssessmentResult } from '../types';

interface Props {
  lastResult: RiskAssessmentResult | null;
  onComplete: (result: RiskAssessmentResult) => void;
}

const levelConfig = {
  low: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    bar: 'bg-green-500',
    label: 'Niedriges Risiko',
    emoji: '✅',
    advice: 'Ihr Risiko für Typ-2-Diabetes ist gering. Behalten Sie Ihren gesunden Lebensstil bei und achten Sie auf regelmäßige Vorsorgeuntersuchungen.',
    actions: [
      'Regelmäßige körperliche Aktivität beibehalten',
      'Ausgewogene Ernährung mit viel Gemüse und Ballaststoffen',
      'Jährliche Blutuntersuchung beim Hausarzt',
      'Gesundes Körpergewicht halten',
    ],
  },
  moderate: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    bar: 'bg-yellow-500',
    label: 'Mittleres Risiko',
    emoji: '⚠️',
    advice: 'Sie haben einige Risikofaktoren für Typ-2-Diabetes. Änderungen im Lebensstil können Ihr Risiko deutlich senken.',
    actions: [
      'Hausarzt aufsuchen für Blutzucker-Screening',
      'Täglich mindestens 30 Min. moderate Bewegung',
      'Zuckerreiche Lebensmittel und Getränke reduzieren',
      'Übergewicht um 5-10% reduzieren falls vorhanden',
    ],
  },
  high: {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    bar: 'bg-orange-500',
    label: 'Erhöhtes Risiko',
    emoji: '⚠️',
    advice: 'Ihr Risiko ist erhöht. Wir empfehlen dringend, einen Arzt aufzusuchen und sofort Maßnahmen zu ergreifen.',
    actions: [
      'DRINGEND: Arzt für Blutzuckertest aufsuchen (HbA1c, Nüchternblutzucker)',
      'Ernährungsberatung in Anspruch nehmen',
      'Täglich 45-60 Min. Ausdauersport (Gehen, Schwimmen)',
      'Stark verarbeitete Lebensmittel vollständig meiden',
      'Gewichtsreduktion priorisieren',
    ],
  },
  very_high: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-red-500',
    label: 'Hohes Risiko',
    emoji: '🚨',
    advice: 'Ihr Risikoprofil ist stark erhöht. Bitte suchen Sie UMGEHEND einen Arzt auf. Es könnten bereits Vorstufen oder Diabetes vorliegen.',
    actions: [
      '🚨 SOFORT: Hausarzt für vollständige Diabetesdiagnostik aufsuchen',
      'Blutzuckermessgerät für zu Hause beschaffen',
      'Alle Zucker und raffinierte Kohlenhydrate sofort eliminieren',
      'Tägliche Bewegung als oberste Priorität',
      'Diabetologischen Facharzt aufsuchen',
      'Ernährungsumstellung mit professioneller Unterstützung',
    ],
  },
};

export function RiskAssessment({ lastResult, onComplete }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);
  // Ein gespeichertes Ergebnis wird direkt angezeigt statt beim Neuladen
  // versehentlich mitten im Fragebogen zu landen.
  const [completed, setCompleted] = useState(lastResult !== null);
  const [result, setResult] = useState<RiskAssessmentResult | null>(lastResult);

  const handleAnswer = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < riskQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      const calc = calculateRiskScore(newAnswers);
      const newResult: RiskAssessmentResult = {
        score: calc.score,
        level: calc.level,
        percentage: calc.percentage,
        answers: newAnswers,
      };
      setResult(newResult);
      setCompleted(true);
      onComplete(newResult);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setStarted(true);
    setCompleted(false);
    setResult(null);
  };

  if (!started && !result) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diabetes-Risikotest</h2>
          <p className="text-gray-500 text-sm mt-1">Wissenschaftlich fundiert – dauert ca. 3 Minuten</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-bold text-gray-900 text-lg mb-2">🔍 Worum geht es?</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Typ-2-Diabetes entwickelt sich oft jahrelang unbemerkt. Millionen Menschen haben bereits erhöhten Blutzucker,
            ohne es zu wissen. Dieser Test hilft Ihnen, Ihr persönliches Risiko einzuschätzen.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-xs text-gray-500">Fragen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-xs text-gray-500">Minuten</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">100%</p>
              <p className="text-xs text-gray-500">Anonym</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            ⚕️ Dieser Test ersetzt keine ärztliche Diagnose, gibt aber wichtige Hinweise.
          </p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Was wird bewertet?</h3>
          <div className="space-y-2">
            {['Alter und Körpergewicht', 'Familiengeschichte', 'Körperliche Aktivität', 'Ernährungsgewohnheiten', 'Symptome und Blutdruck', 'Lebensstil und Schlaf'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setStarted(true)} className="btn-primary w-full text-center">
          Test jetzt starten →
        </button>
      </div>
    );
  }

  if (completed && result) {
    const config = levelConfig[result.level];
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ihr Ergebnis</h2>
          <p className="text-gray-500 text-sm">Persönliche Risikobewertung</p>
        </div>

        <div className={`rounded-2xl p-6 border ${config.bg} ${config.border}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{config.emoji}</span>
            <div>
              <p className="text-sm text-gray-600">Ihr Risiko-Score</p>
              <p className={`text-3xl font-bold ${config.color}`}>{result.percentage}%</p>
              <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/60 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all ${config.bar}`}
              style={{ width: `${result.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Niedrig</span>
            <span>Mittel</span>
            <span>Hoch</span>
            <span>Sehr hoch</span>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-2">📋 Was bedeutet das?</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{config.advice}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">✅ Empfohlene Maßnahmen</h3>
          <div className="space-y-2">
            {config.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5 flex-shrink-0">→</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 text-center">
            ⚕️ Dieser Test ist kein medizinisches Diagnosewerkzeug. Bei Bedenken sprechen Sie mit Ihrem Arzt.
          </p>
        </div>

        <button onClick={handleRestart} className="btn-secondary w-full">
          Test wiederholen
        </button>
      </div>
    );
  }

  const question = riskQuestions[currentQuestion];
  const progress = ((currentQuestion) / riskQuestions.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Risikotest</h2>
          <span className="text-sm text-gray-500">{currentQuestion + 1} / {riskQuestions.length}</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="card">
        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-3">
          Frage {currentQuestion + 1}
        </p>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{question.question}</h3>
        {question.info && (
          <p className="text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2 mb-4">
            💡 {question.info}
          </p>
        )}

        <div className="space-y-3 mt-4">
          {question.options.map((option) => (
            <button
              key={option.label}
              onClick={() => handleAnswer(question.id, option.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all hover:border-green-400 hover:bg-green-50 ${
                answers[question.id] === option.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <p className="text-sm font-medium text-gray-800">{option.label}</p>
              {option.description && (
                <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {currentQuestion > 0 && (
        <button
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          className="btn-secondary w-full"
        >
          ← Zurück
        </button>
      )}
    </div>
  );
}
