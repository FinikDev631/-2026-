import { Party } from '../types';
import { SeatDistributionResult } from './electoralCalculations';

export interface ElectionExportData {
  election: string;
  version: string;
  exportedAt: string;
  totalSeats: number;
  calculationMode: string;
  totalVotesPercentage: number;
  majorityParty: string | null;
  majorityType: 'constitutional' | 'simple' | 'coalition';
  parties: {
    id: string;
    name: string;
    shortName: string;
    percentage: number;
    seats: number;
    seatPercentage: number;
    passedThreshold: boolean;
    color: string;
    leader?: string;
  }[];
}

export function exportToJsonFile(
  parties: Party[],
  results: SeatDistributionResult[],
  totalSeats: number,
  proportionalOnly: boolean,
  majorityParty: SeatDistributionResult | null,
  hasConstitutionalMajority: boolean,
  hasSimpleMajority: boolean
) {
  const totalVotesPercentage = parties.reduce((sum, p) => sum + p.percentage, 0);

  const data: ElectionExportData = {
    election: 'Выборы в Государственную Думу РФ 2026 года',
    version: '1.0',
    exportedAt: new Date().toLocaleString('ru-RU'),
    totalSeats,
    calculationMode: proportionalOnly
      ? '225 мандатов (только по партийным спискам)'
      : '450 мандатов (полный состав Государственной Думы)',
    totalVotesPercentage: Math.round(totalVotesPercentage * 10) / 10,
    majorityParty: majorityParty ? majorityParty.partyName : null,
    majorityType: hasConstitutionalMajority
      ? 'constitutional'
      : hasSimpleMajority
      ? 'simple'
      : 'coalition',
    parties: parties.map((p) => {
      const r = results.find((res) => res.partyId === p.id);
      return {
        id: p.id,
        name: p.name,
        shortName: p.shortName,
        percentage: p.percentage,
        seats: r ? r.seats : 0,
        seatPercentage: r ? Math.round(r.seatPercentage * 10) / 10 : 0,
        passedThreshold: p.percentage >= 5.0,
        color: p.color,
        leader: p.leader,
      };
    }),
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `vybory-2026-prognoz-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPrintPdf(
  parties: Party[],
  results: SeatDistributionResult[],
  totalSeats: number,
  proportionalOnly: boolean,
  majorityParty: SeatDistributionResult | null,
  hasConstitutionalMajority: boolean,
  hasSimpleMajority: boolean
) {
  const totalVotesPercentage = parties.reduce((sum, p) => sum + p.percentage, 0);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Пожалуйста, разрешите всплывающие окна в браузере для печати и экспорта в PDF.');
    return;
  }

  const majorityText = hasConstitutionalMajority && majorityParty
    ? `Партия «${majorityParty.partyName}» получает конституционное большинство (${majorityParty.seats} мест, ≥ 2/3).`
    : hasSimpleMajority && majorityParty
    ? `Партия «${majorityParty.partyName}» получает простое большинство (${majorityParty.seats} мест, ≥ 50%).`
    : 'Ни одна партия не набирает абсолютного большинства (коалиционная конфигурация).';

  const rowsHtml = results
    .map((r) => {
      const party = parties.find((p) => p.id === r.partyId);
      return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${r.color}; margin-right: 8px;"></span>
          ${r.partyName} (${r.shortName})
          ${party?.leader ? `<br><span style="font-size: 11px; font-weight: normal; color: #64748b;">Лидер: ${party.leader}</span>` : ''}
        </td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: bold; font-size: 14px;">
          ${r.percentage.toFixed(1)}%
        </td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: bold; font-size: 15px; color: ${r.passedThreshold ? r.color : '#94a3b8'};">
          ${r.seats} мест
        </td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; color: #334155;">
          ${r.passedThreshold ? `${r.seatPercentage.toFixed(1)}%` : '0.0%'}
        </td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; ${
            r.passedThreshold
              ? 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;'
              : 'background-color: #f1f5f9; color: #64748b;'
          }">
            ${r.passedThreshold ? 'Проходит (≥5%)' : 'Ниже 5%'}
          </span>
        </td>
      </tr>
    `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Выборы 2026 — Прогноз распределения мандатов</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 24px;
          color: #0f172a;
          background: #ffffff;
        }
        .header {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 22px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
        }
        .subtitle {
          font-size: 13px;
          color: #475569;
          margin: 0;
        }
        .meta-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 13px;
          line-height: 1.6;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background-color: #f1f5f9;
          color: #475569;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 12px;
          text-align: left;
          border-bottom: 2px solid #cbd5e1;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 14px;
          font-size: 11px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 16px; display: flex; gap: 8px;">
        <button onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Сохранить в PDF / Печать
        </button>
        <button onclick="window.close()" style="background: #e2e8f0; color: #334155; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Закрыть
        </button>
      </div>

      <div class="header">
        <h1 class="title">ВЫБОРЫ В ГОСУДАРСТВЕННУЮ ДУМУ 2026</h1>
        <p class="subtitle">Аналитический прогноз распределения голосов и депутатских мандатов</p>
      </div>

      <div class="meta-box">
        <div><strong>Дата формирования отчета:</strong> ${new Date().toLocaleString('ru-RU')}</div>
        <div><strong>База расчета:</strong> ${totalSeats} мандатов (${proportionalOnly ? 'только по партийным спискам' : 'полный состав Государственной Думы'})</div>
        <div><strong>Сумма распределенных голосов:</strong> ${totalVotesPercentage.toFixed(1)}%</div>
        <div><strong>Парламентское большинство:</strong> ${majorityText}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Политическая партия</th>
            <th style="text-align: right;">Голоса (%)</th>
            <th style="text-align: right;">Расчетные мандаты</th>
            <th style="text-align: right;">Доля в Думе</th>
            <th style="text-align: center;">Статус 5%</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <span>Калькулятор «Выборы 2026» • Метод пропорционального представительства (квота Гаре)</span>
        <span>Страница 1 из 1</span>
      </div>

      <script>
        window.onload = function() {
          // Trigger print dialog after DOM loads
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
