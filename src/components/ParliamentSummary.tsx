import React, { useState } from 'react';
import { SeatDistributionResult } from '../utils/electoralCalculations';
import { PartyLogo } from './PartyLogo';
import { Party } from '../types';
import { exportToJsonFile, exportToPrintPdf } from '../utils/exportUtils';
import { Download, FileText, Copy, Check } from 'lucide-react';

interface ParliamentSummaryProps {
  results: SeatDistributionResult[];
  parties: Party[];
  totalSeats: number;
  proportionalOnly: boolean;
  onToggleProportionalOnly: (value: boolean) => void;
  majorityParty: SeatDistributionResult | null;
  hasConstitutionalMajority: boolean;
  hasSimpleMajority: boolean;
}

export const ParliamentSummary: React.FC<ParliamentSummaryProps> = ({
  results,
  parties,
  totalSeats,
  proportionalOnly,
  onToggleProportionalOnly,
  majorityParty,
  hasConstitutionalMajority,
  hasSimpleMajority,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const lines = [
      `Выборы в Государственную Думу 2026 — Расчет мандатов (${totalSeats} мест):`,
      ...results.map(
        (r) =>
          `• ${r.partyName} (${r.shortName}): ${r.percentage.toFixed(1)}% голосов — ${
            r.passedThreshold
              ? `${r.seats} мандатов (${r.seatPercentage.toFixed(1)}%)`
              : 'Ниже 5% барьера'
          }`
      ),
      '',
      hasConstitutionalMajority && majorityParty
        ? `Конституционное большинство: «${majorityParty.partyName}» (${majorityParty.seats} мест, ≥ 2/3).`
        : hasSimpleMajority && majorityParty
        ? `Простое большинство: «${majorityParty.partyName}» (${majorityParty.seats} мест, ≥ 50%).`
        : 'Коалиция: ни одна партия не получила абсолютного большинства.',
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportPdf = () => {
    exportToPrintPdf(
      parties,
      results,
      totalSeats,
      proportionalOnly,
      majorityParty,
      hasConstitutionalMajority,
      hasSimpleMajority
    );
  };

  const handleExportJson = () => {
    exportToJsonFile(
      parties,
      results,
      totalSeats,
      proportionalOnly,
      majorityParty,
      hasConstitutionalMajority,
      hasSimpleMajority
    );
  };

  const getPartyById = (id: string) => parties.find((p) => p.id === id);

  return (
    <div
      id="summary-table-card"
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col gap-3.5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Итоги распределения мандатов (Выборы 2026)</h3>
          <p className="text-xs text-slate-500">Метод наибольших остатков (квота Гаре, барьер 5%)</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold mr-1">
            <button
              type="button"
              id="switch-450"
              onClick={() => onToggleProportionalOnly(false)}
              className={`px-2.5 py-1 rounded transition-colors ${
                !proportionalOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              450 мест
            </button>
            <button
              type="button"
              id="switch-225"
              onClick={() => onToggleProportionalOnly(true)}
              className={`px-2.5 py-1 rounded transition-colors ${
                proportionalOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              225 мест
            </button>
          </div>

          {/* Export PDF Button */}
          <button
            type="button"
            id="export-pdf-summary-btn"
            onClick={handleExportPdf}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Экспорт отчета в PDF для печати или сохранения"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF</span>
          </button>

          {/* Export JSON Button */}
          <button
            type="button"
            id="export-json-summary-btn"
            onClick={handleExportJson}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Скачать расчет в формате JSON"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>JSON</span>
          </button>

          {/* Copy text */}
          <button
            type="button"
            onClick={handleCopyReport}
            className="p-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Скопировать текстовую сводку"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Majority Status Banner */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <span className="font-bold text-slate-900 mr-1">Статус парламентского большинства:</span>
        <span className="text-slate-700">
          {hasConstitutionalMajority && majorityParty
            ? `«${majorityParty.partyName}» получает конституционное большинство (${majorityParty.seats} мест из ${totalSeats}, ≥ 2/3).`
            : hasSimpleMajority && majorityParty
            ? `«${majorityParty.partyName}» получает простое большинство (${majorityParty.seats} мест из ${totalSeats}, ≥ 50%).`
            : 'Ни одна партия не набирает абсолютного большинства (коалиционная конфигурация).'}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-2 px-2">Партия</th>
              <th className="py-2 px-2 text-right">Голоса</th>
              <th className="py-2 px-2 text-right">Мандаты</th>
              <th className="py-2 px-2 text-right">Доля в Думе</th>
              <th className="py-2 px-2 text-center">Барьер 5%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((r) => {
              const party = getPartyById(r.partyId);
              return (
                <tr key={r.partyId} className="hover:bg-slate-50">
                  <td className="py-2.5 px-2 flex items-center gap-2">
                    <PartyLogo partyId={r.partyId} customImage={party?.customImage} size="sm" />
                    <div>
                      <div className="font-bold text-slate-900">{r.partyName}</div>
                      <div className="text-[10px] text-slate-400">{r.shortName}</div>
                    </div>
                  </td>

                  <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">
                    {r.percentage.toFixed(1)}%
                  </td>

                  <td className="py-2.5 px-2 text-right font-mono">
                    <span
                      className="font-extrabold text-sm"
                      style={{ color: r.passedThreshold ? r.color : '#94A3B8' }}
                    >
                      {r.seats}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-1">мест</span>
                  </td>

                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                    {r.passedThreshold ? `${r.seatPercentage.toFixed(1)}%` : '0%'}
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {r.passedThreshold ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        Проходит
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Ниже 5%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
