import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { WeightEntry } from '../types';
import { newId } from '../utils/health';

interface Props {
  entries: WeightEntry[];
  heightCm: number | null;
  onAdd: (entry: WeightEntry) => void;
  onDelete: (id: string) => void;
  onHeightChange: (cm: number | null) => void;
}

function bmiRating(bmi: number) {
  if (bmi < 18.5) return { label: 'Untergewicht', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (bmi < 25) return { label: 'Normalgewicht', color: 'text-green-600', bg: 'bg-green-50' };
  if (bmi < 30) return { label: 'Übergewicht', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  if (bmi < 35) return { label: 'Adipositas Grad I', color: 'text-orange-600', bg: 'bg-orange-50' };
  return { label: 'Adipositas Grad II+', color: 'text-red-600', bg: 'bg-red-50' };
}

export function WeightTracker({ entries, heightCm, onAdd, onDelete, onHeightChange }: Props) {
  const [weight, setWeight] = useState('');
  const [heightInput, setHeightInput] = useState(heightCm ? String(heightCm) : '');

  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
  const first = entries.length > 1 ? entries[0] : null;
  const diff = latest && first ? Math.round((latest.weight - first.weight) * 10) / 10 : null;

  const bmi = latest && heightCm
    ? Math.round((latest.weight / ((heightCm / 100) ** 2)) * 10) / 10
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight.replace(',', '.'));
    if (!w || w < 30 || w > 300) return;
    onAdd({ id: newId(), weight: w, timestamp: new Date().toISOString() });
    setWeight('');
  };

  const handleHeightBlur = () => {
    const h = parseInt(heightInput);
    onHeightChange(h >= 100 && h <= 230 ? h : null);
  };

  const chartData = [...entries]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-20)
    .map((e) => ({
    date: new Date(e.timestamp).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }),
    weight: e.weight,
  }));

  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-r from-gray-50 to-gray-100 !p-4">
        <p className="text-xs text-gray-600">
          💡 <strong>Warum Gewicht tracken?</strong> Schon 5–10 % Gewichtsverlust senken das
          Diabetesrisiko um bis zu 58 % und verbessern die Insulinempfindlichkeit deutlich.
        </p>
      </div>

      {/* Aktueller Stand */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card !p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Aktuell</p>
          <p className="text-xl font-bold text-gray-900">{latest ? String(latest.weight).replace('.', ',') : '–'}</p>
          <p className="text-xs text-gray-400">kg</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Veränderung</p>
          <p className={`text-xl font-bold ${diff === null ? 'text-gray-900' : diff < 0 ? 'text-green-600' : diff > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {diff !== null ? `${diff > 0 ? '+' : ''}${String(diff).replace('.', ',')}` : '–'}
          </p>
          <p className="text-xs text-gray-400">kg gesamt</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">BMI</p>
          <p className={`text-xl font-bold ${bmi ? bmiRating(bmi).color : 'text-gray-900'}`}>
            {bmi ? String(bmi).replace('.', ',') : '–'}
          </p>
          <p className="text-xs text-gray-400">{bmi ? bmiRating(bmi).label : 'Größe angeben'}</p>
        </div>
      </div>

      {/* Eingabe */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Neues Gewicht eintragen</h3>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="z.B. 82,5"
            className="input-field"
            required
          />
          <div className="flex items-center justify-center w-14 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium">
            kg
          </div>
          <button type="submit" className="btn-primary !py-2 whitespace-nowrap">Speichern</button>
        </form>
        <div className="flex items-center gap-2 mt-3">
          <label className="text-xs text-gray-500 whitespace-nowrap">Ihre Körpergröße:</label>
          <input
            type="number"
            value={heightInput}
            onChange={(e) => setHeightInput(e.target.value)}
            onBlur={handleHeightBlur}
            placeholder="z.B. 175"
            min="100"
            max="230"
            className="input-field !py-1.5 !px-3 text-sm w-24"
          />
          <span className="text-xs text-gray-400">cm (für BMI-Berechnung)</span>
        </div>
      </div>

      {/* Verlauf */}
      {entries.length >= 2 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Gewichtsverlauf</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid vertical={false} stroke="#eef0f3" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#98a2b3' }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11, fill: '#98a2b3' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [`${value} kg`, 'Gewicht']}
                cursor={{ stroke: '#d0d5dd', strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: 12, border: '1px solid #eaecf0', fontSize: 12,
                  boxShadow: '0 8px 24px rgba(16,24,40,0.12)', padding: '8px 12px',
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#0284c7" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Liste */}
      {entries.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Alle Einträge</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...entries].reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-gray-900">{String(entry.weight).replace('.', ',')} kg</p>
                  <button
                    onClick={() => onDelete(entry.id)}
                    aria-label="Gewichtseintrag löschen"
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">⚖️</p>
          <p className="text-sm">Noch keine Gewichtseinträge – wiegen Sie sich 1× pro Woche, immer zur gleichen Zeit.</p>
        </div>
      )}
    </div>
  );
}
