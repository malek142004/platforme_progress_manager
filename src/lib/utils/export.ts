import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Membre, Tache } from '@/types/database';
import { fmtDate, joursRestants } from './dates';
import { PRIORITE_LABELS, RISQUE_LABELS, STATUS_LABELS } from './labels';
import type { MembreStats } from './stats';

export interface PerfRow {
  membre: Membre;
  stats: MembreStats;
}

const pct = (n: number) => `${Math.round(n * 10) / 10} %`;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

export function exportFilename(scope: string, ext: 'csv' | 'pdf') {
  return `performances-${slug(scope)}-${format(new Date(), 'yyyy-MM-dd')}.${ext}`;
}

/** CSV (séparateur « ; » + BOM UTF-8 pour une ouverture correcte dans Excel FR). */
export function exportCsv(rows: PerfRow[], taches: Tache[], scope: string) {
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines: (string | number)[][] = [
    ['Membre', 'Email', 'Rôle', 'Tâches totales', 'Tâches terminées', 'Taux de complétion (%)', 'Avancement moyen (%)', 'Score', 'Tâches en retard'],
    ...rows.map(({ membre: m, stats: s }) => [
      m.nom_complet,
      m.email ?? '',
      m.role_management ?? m.tache_dev ?? '',
      s.totales,
      s.terminees,
      s.taux,
      s.avancementMoyen,
      s.score,
      s.enRetard,
    ]),
  ];

  const ids = new Set(rows.map((r) => r.membre.id));
  const names = new Map(rows.map((r) => [r.membre.id, r.membre.nom_complet]));
  const detail = taches.filter((t) => t.membre_id && ids.has(t.membre_id));
  if (detail.length) {
    lines.push([], ['Détail des tâches'], ['Membre', 'Tâche', 'Status', 'Priorité', 'Risque', 'Deadline', 'Jours restants', 'Avancement (%)']);
    for (const t of detail) {
      lines.push([
        names.get(t.membre_id!) ?? '',
        t.titre,
        STATUS_LABELS[t.status],
        PRIORITE_LABELS[t.priorite],
        RISQUE_LABELS[t.risque],
        fmtDate(t.deadline, 'dd/MM/yyyy'),
        t.status === 'done' ? '' : joursRestants(t.deadline) ?? '',
        t.avancement,
      ]);
    }
  }

  const csv = '﻿' + lines.map((l) => l.map(esc).join(';')).join('\r\n');
  download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), exportFilename(scope, 'csv'));
}

/** PDF : en-tête indigo, tableau récapitulatif, puis détail des tâches. */
export async function exportPdf(rows: PerfRow[], taches: Tache[], scope: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(79, 82, 198);
  doc.rect(0, 0, W, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Rapport de performances', 40, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${scope} · ${format(new Date(), 'd MMMM yyyy', { locale: fr })}`, W - 40, 42, { align: 'right' });

  const head = { fillColor: [79, 82, 198] as [number, number, number], textColor: 255, fontStyle: 'bold' as const };
  const alt = { fillColor: [243, 244, 253] as [number, number, number] };

  autoTable(doc, {
    startY: 95,
    head: [['Membre', 'Rôle', 'Tâches', 'Terminées', 'Complétion', 'Avancement moyen', 'Score', 'En retard']],
    body: rows.map(({ membre: m, stats: s }) => [
      m.nom_complet,
      m.role_management ?? m.tache_dev ?? '—',
      s.totales,
      s.terminees,
      pct(s.taux),
      pct(s.avancementMoyen),
      s.score.toFixed(1),
      s.enRetard,
    ]),
    headStyles: head,
    alternateRowStyles: alt,
    styles: { fontSize: 9, cellPadding: 6, textColor: [43, 45, 66] },
  });

  const ids = new Set(rows.map((r) => r.membre.id));
  const names = new Map(rows.map((r) => [r.membre.id, r.membre.nom_complet]));
  const detail = taches.filter((t) => t.membre_id && ids.has(t.membre_id));
  if (detail.length) {
    const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 28;
    doc.setTextColor(43, 45, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Détail des tâches', 40, y);
    autoTable(doc, {
      startY: y + 10,
      head: [['Membre', 'Tâche', 'Status', 'Priorité', 'Risque', 'Deadline', 'Jours restants', 'Avancement']],
      body: detail.map((t) => {
        const j = joursRestants(t.deadline);
        return [
          names.get(t.membre_id!) ?? '',
          t.titre,
          STATUS_LABELS[t.status],
          PRIORITE_LABELS[t.priorite],
          RISQUE_LABELS[t.risque],
          fmtDate(t.deadline, 'dd/MM/yyyy'),
          t.status === 'done' || j === null ? '—' : String(j),
          `${t.avancement} %`,
        ];
      }),
      headStyles: head,
      alternateRowStyles: alt,
      styles: { fontSize: 8, cellPadding: 5, textColor: [43, 45, 66] },
    });
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(154, 156, 181);
    doc.text(`Score = 0,6 × taux de complétion + 0,4 × avancement moyen · page ${i}/${pages}`, 40, doc.internal.pageSize.getHeight() - 20);
  }

  doc.save(exportFilename(scope, 'pdf'));
}
