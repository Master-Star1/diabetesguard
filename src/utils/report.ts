import { jsPDF } from 'jspdf';
import type { BloodSugarEntry, GlucoseUnit, Medication, Profile, WeightEntry } from '../types';
import { toDisplayUnit, unitLabel } from '../types';
import { contextLabel, tirRange } from './health';

interface ReportInput {
  entries: BloodSugarEntry[];
  weights: WeightEntry[];
  medications: Medication[];
  unit: GlucoseUnit;
  profile: Profile;
  days: 30 | 90;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('de-DE');
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const de = (n: number) => String(n).replace('.', ',');

/**
 * Arztbericht als PDF – Zusammenfassung, Verlaufskurve, Messtabelle,
 * Medikationsplan. Ohne Namen/Personendaten: der Nutzer entscheidet selbst,
 * wem er die Datei gibt.
 */
export function buildDoctorReport({ entries, weights, medications, unit, profile, days }: ReportInput): Blob {
  const [tirLow, tirHigh] = tirRange(profile);
  const cutoff = Date.now() - days * 86400000;
  const rows = [...entries]
    .filter((e) => new Date(e.timestamp).getTime() >= cutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 16;
  let y = 0;

  const green: [number, number, number] = [22, 163, 74];
  const ink: [number, number, number] = [16, 24, 40];
  const muted: [number, number, number] = [102, 112, 133];

  const header = () => {
    doc.setFillColor(...green);
    doc.rect(0, 0, W, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('DiabetesGuard – Blutzuckerbericht', M, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${profile === 'pregnancy' ? 'Schwangerschaftsdiabetes · ' : ''}Zeitraum: letzte ${days} Tage · erstellt am ${new Date().toLocaleDateString('de-DE')}`, W - M, 14, { align: 'right' });
    doc.setTextColor(...ink);
    y = 32;
  };

  const footer = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(...muted);
      doc.text(
        'Selbst erfasste Werte aus der DiabetesGuard-App. Kein Medizinprodukt – ersetzt keine ärztliche Diagnostik. HbA1c-Wert ist eine rechnerische Schätzung (ADAG-Formel).',
        M, 290, { maxWidth: W - 2 * M - 20 },
      );
      doc.text(`Seite ${i} / ${pages}`, W - M, 290, { align: 'right' });
    }
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      header();
    }
  };

  const sectionTitle = (t: string) => {
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...ink);
    doc.text(t, M, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
  };

  header();

  // ── Zusammenfassung ────────────────────────────────────────────────────────
  sectionTitle('Zusammenfassung');
  const vals = rows.map((e) => e.value);
  const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  const inRange = vals.filter((v) => v >= tirLow && v <= tirHigh).length;
  const tir = vals.length ? Math.round((inRange / vals.length) * 100) : null;
  const hypos = vals.filter((v) => v < 70).length;
  const a1c = avg !== null && vals.length >= 5 ? Math.round(((avg + 46.7) / 28.7) * 10) / 10 : null;
  const fasting = rows.filter((e) => e.mealContext === 'fasting').map((e) => e.value);
  const fastingAvg = fasting.length ? Math.round(fasting.reduce((a, b) => a + b, 0) / fasting.length) : null;

  const tiles: [string, string][] = [
    ['Messungen', String(vals.length)],
    [`Ø Blutzucker (${unitLabel(unit)})`, avg !== null ? de(toDisplayUnit(avg, unit)) : '–'],
    [`Ø Nüchtern (${unitLabel(unit)})`, fastingAvg !== null ? de(toDisplayUnit(fastingAvg, unit)) : '–'],
    [`Zeit im Zielbereich (${tirLow}–${tirHigh})`, tir !== null ? `${tir} %` : '–'],
    ['Unterzuckerungen (< 70)', String(hypos)],
    ['Geschätzter HbA1c', a1c !== null ? `${de(a1c)} %` : '–'],
  ];
  const tileW = (W - 2 * M - 10) / 3;
  tiles.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * (tileW + 5);
    const ty = y + row * 20;
    doc.setFillColor(246, 247, 249);
    doc.roundedRect(x, ty, tileW, 17, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(label, x + 4, ty + 6);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ink);
    doc.text(value, x + 4, ty + 13.5);
    doc.setFont('helvetica', 'normal');
  });
  y += 46;

  // ── Verlaufskurve ──────────────────────────────────────────────────────────
  if (rows.length >= 2) {
    sectionTitle('Verlauf');
    const cx = M, cy = y, cw = W - 2 * M, ch = 50;
    const minV = 40, maxV = Math.max(250, ...vals) + 10;
    const px = (i: number) => cx + (i / (rows.length - 1)) * cw;
    const py = (v: number) => cy + ch - ((v - minV) / (maxV - minV)) * ch;

    // Zielbereich als Band
    doc.setFillColor(220, 252, 231);
    doc.rect(cx, py(tirHigh), cw, py(tirLow) - py(tirHigh), 'F');
    // Gitterlinien
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    (profile === 'pregnancy' ? [63, 95, 120, 140, 180] : [70, 100, 140, 180, 250]).forEach((g) => {
      if (g > maxV) return;
      doc.line(cx, py(g), cx + cw, py(g));
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(de(toDisplayUnit(g, unit)), cx - 1.5, py(g) + 1, { align: 'right' });
    });
    // Kurve
    doc.setDrawColor(...green);
    doc.setLineWidth(0.6);
    for (let i = 1; i < rows.length; i++) {
      doc.line(px(i - 1), py(rows[i - 1].value), px(i), py(rows[i].value));
    }
    // Ausreißer markieren
    rows.forEach((e, i) => {
      if (e.value < tirLow || e.value > tirHigh) {
        doc.setFillColor(e.value < 70 ? 37 : 240, e.value < 70 ? 99 : 68, e.value < 70 ? 235 : 56);
        doc.circle(px(i), py(e.value), 0.9, 'F');
      }
    });
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(fmtDate(rows[0].timestamp), cx, cy + ch + 4);
    doc.text(fmtDate(rows[rows.length - 1].timestamp), cx + cw, cy + ch + 4, { align: 'right' });
    doc.text(`Grünes Band = Zielbereich ${tirLow}–${tirHigh} mg/dL · Punkte = Werte außerhalb`, cx + cw / 2, cy + ch + 4, { align: 'center' });
    y = cy + ch + 12;
  }

  // ── Medikation ─────────────────────────────────────────────────────────────
  const activeMeds = medications.filter((m) => m.active);
  if (activeMeds.length > 0) {
    sectionTitle('Aktueller Medikationsplan');
    doc.setFontSize(9);
    activeMeds.forEach((m) => {
      ensureSpace(6);
      doc.setTextColor(...ink);
      doc.text(`• ${m.name}${m.dose ? ` – ${m.dose}` : ''}`, M + 2, y);
      doc.setTextColor(...muted);
      doc.text(m.times.length ? m.times.join(', ') + ' Uhr' : 'nach Bedarf', W - M, y, { align: 'right' });
      y += 5.5;
    });
    y += 3;
  }

  // ── Gewicht ────────────────────────────────────────────────────────────────
  const wRows = weights.filter((w) => new Date(w.timestamp).getTime() >= cutoff);
  if (wRows.length > 0) {
    sectionTitle('Gewicht');
    doc.setFontSize(9);
    const first = wRows[0], last = wRows[wRows.length - 1];
    const diff = Math.round((last.weight - first.weight) * 10) / 10;
    doc.setTextColor(...ink);
    doc.text(
      `${de(last.weight)} kg am ${fmtDate(last.timestamp)}` +
      (wRows.length > 1 ? `  (${diff > 0 ? '+' : ''}${de(diff)} kg seit ${fmtDate(first.timestamp)})` : ''),
      M + 2, y,
    );
    y += 9;
  }

  // ── Messtabelle ────────────────────────────────────────────────────────────
  sectionTitle(`Alle Messungen (${rows.length})`);
  const cols = [M, M + 24, M + 38, M + 62, M + 92, M + 108];
  const drawTableHead = () => {
    doc.setFillColor(246, 247, 249);
    doc.rect(M, y - 4, W - 2 * M, 6.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...muted);
    ['Datum', 'Zeit', unitLabel(unit), 'Messzeitpunkt', 'KH', 'Notiz / Tags'].forEach((h, i) => doc.text(h, cols[i], y));
    doc.setFont('helvetica', 'normal');
    y += 6;
  };
  drawTableHead();
  doc.setFontSize(8);
  rows.forEach((e) => {
    if (y > 278) {
      doc.addPage();
      header();
      drawTableHead();
    }
    const out = e.value < tirLow || e.value > tirHigh;
    doc.setTextColor(...(out ? ([180, 35, 24] as [number, number, number]) : ink));
    doc.text(fmtDate(e.timestamp), cols[0], y);
    doc.text(fmtTime(e.timestamp), cols[1], y);
    doc.setFont('helvetica', out ? 'bold' : 'normal');
    doc.text(de(toDisplayUnit(e.value, unit)), cols[2], y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...ink);
    doc.text(contextLabel(e.mealContext, profile), cols[3], y);
    doc.text(e.carbs !== undefined ? `${e.carbs} g` : '', cols[4], y);
    const extra = [...(e.tags ?? []), e.notes ?? ''].filter(Boolean).join(' · ');
    doc.setTextColor(...muted);
    doc.text(extra.length > 45 ? extra.slice(0, 44) + '…' : extra, cols[5], y);
    y += 5;
  });

  footer();
  return doc.output('blob');
}
