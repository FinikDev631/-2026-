import React from 'react';
import { Party, PresetScenario } from '../types';

interface TotalDistributionBarProps {
  parties: Party[];
  totalPercentage: number;
  presets: PresetScenario[];
  activePresetId: string | null;
  autoBalance: boolean;
  onToggleAutoBalance: () => void;
  onBalanceTo100: () => void;
  onSelectPreset: (preset: PresetScenario) => void;
  onResetAll: () => void;
}

export const TotalDistributionBar: React.FC<TotalDistributionBarProps> = ({
  parties,
  totalPercentage,
  presets,
  activePresetId,
  autoBalance,
  onToggleAutoBalance,
  onBalanceTo100,
  onSelectPreset,
  onResetAll,
}) => {
  const isPerfect100 = Math.abs(totalPercentage - 100) < 0.1;
  const isOver100 = totalPercentage > 100.1;

  return (
    <div
      id="distribution-bar"
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col gap-3.5"
    >
      {/* Top Controls: Total Indicator & Presets */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Сумма голосов:
            </span>
            <span
              className={`font-mono font-extrabold text-lg px-2.5 py-0.5 rounded ${
                isPerfect100
                  ? 'bg-slate-100 text-slate-900'
                  : isOver100
                  ? 'bg-red-50 text-red-700'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {totalPercentage.toFixed(1)}%
            </span>
          </div>

          {!isPerfect100 && (
            <button
              type="button"
              id="balance-btn"
              onClick={onBalanceTo100}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Сбалансировать до 100%
            </button>
          )}

          <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium select-none ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoBalance}
              onChange={onToggleAutoBalance}
              className="rounded border-slate-300 text-blue-600 cursor-pointer"
            />
            <span>Автобаланс 100%</span>
          </label>
        </div>

        {/* Presets Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1 font-medium">Сценарии:</span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                activePresetId === preset.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset.title}
            </button>
          ))}
          <button
            type="button"
            onClick={onResetAll}
            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-900 underline"
          >
            Сброс
          </button>
        </div>
      </div>

      {/* Stacked Percentage Bar */}
      <div className="w-full">
        <div className="h-6 w-full bg-slate-100 rounded overflow-hidden flex border border-slate-200">
          {parties.map((party) => {
            if (party.percentage <= 0) return null;
            const width =
              totalPercentage > 0 ? (party.percentage / Math.max(100, totalPercentage)) * 100 : 0;

            return (
              <div
                key={party.id}
                style={{
                  width: `${width}%`,
                  backgroundColor: party.color,
                }}
                className="h-full flex items-center justify-center overflow-hidden transition-all"
                title={`${party.name}: ${party.percentage.toFixed(1)}%`}
              >
                {width > 6 && (
                  <span className="text-[11px] font-bold text-white px-1 truncate select-none">
                    {party.shortName} {party.percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
