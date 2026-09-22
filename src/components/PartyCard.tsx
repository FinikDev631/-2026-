import React, { useRef } from 'react';
import { Party } from '../types';
import { PartyLogo } from './PartyLogo';
import { Lock, Unlock, Camera, RotateCcw } from 'lucide-react';

interface PartyCardProps {
  party: Party;
  seats: number;
  totalSeats: number;
  passedThreshold: boolean;
  onPercentageChange: (id: string, newPercentage: number) => void;
  onToggleLock: (id: string) => void;
  onImageUpload: (id: string, imageData: string) => void;
  onResetImage: (id: string) => void;
}

export const PartyCard: React.FC<PartyCardProps> = ({
  party,
  seats,
  totalSeats,
  passedThreshold,
  onPercentageChange,
  onToggleLock,
  onImageUpload,
  onResetImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onPercentageChange(party.id, isNaN(val) ? 0 : Math.round(val * 10) / 10);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    onPercentageChange(party.id, Math.round(val * 10) / 10);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onImageUpload(party.id, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const adjustPercent = (delta: number) => {
    const next = Math.max(0, Math.min(100, Math.round((party.percentage + delta) * 10) / 10));
    onPercentageChange(party.id, next);
  };

  return (
    <div
      id={`party-card-${party.id}`}
      className={`bg-white rounded-xl border transition-all ${
        party.isLocked
          ? 'border-amber-400 shadow-xs'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Top Header: Logo, Party Info, Lock & Photo Buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative group shrink-0">
              <PartyLogo
                partyId={party.id}
                customImage={party.customImage}
                size="lg"
                altText={party.name}
              />
              <button
                type="button"
                id={`upload-btn-${party.id}`}
                onClick={() => fileInputRef.current?.click()}
                title="Загрузить свое изображение или фото"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity rounded-xl cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">
                  {party.name}
                </h3>
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold shrink-0"
                  style={{ backgroundColor: party.badgeBg, color: party.textColor }}
                >
                  {party.shortName}
                </span>
              </div>
              {party.leader && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Лидер: <span className="text-slate-800 font-medium">{party.leader}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {party.customImage && (
              <button
                type="button"
                id={`reset-img-${party.id}`}
                onClick={() => onResetImage(party.id)}
                title="Вернуть стандартный логотип"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              id={`lock-btn-${party.id}`}
              onClick={() => onToggleLock(party.id)}
              title={party.isLocked ? 'Разблокировать процент' : 'Зафиксировать процент при балансировке'}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                party.isLocked
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {party.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Input & Adjust Stepper Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Main Percentage Display & Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <input
                id={`number-input-${party.id}`}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={party.percentage}
                onChange={handleInputChange}
                className="w-24 text-right pr-6 py-1.5 font-mono font-extrabold text-slate-900 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-800 text-lg"
              />
              <span className="absolute right-2 font-bold text-slate-500 text-sm pointer-events-none">
                %
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">голосов</span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              id={`btn-m5-${party.id}`}
              onClick={() => adjustPercent(-5)}
              className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              -5%
            </button>
            <button
              type="button"
              id={`btn-m1-${party.id}`}
              onClick={() => adjustPercent(-1)}
              className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              -1%
            </button>
            <button
              type="button"
              id={`btn-p1-${party.id}`}
              onClick={() => adjustPercent(1)}
              className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              +1%
            </button>
            <button
              type="button"
              id={`btn-p5-${party.id}`}
              onClick={() => adjustPercent(5)}
              className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              +5%
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="flex flex-col gap-1">
          <input
            id={`slider-${party.id}`}
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={party.percentage}
            onChange={handleSliderChange}
            className="w-full h-2 rounded appearance-none cursor-pointer bg-slate-200 focus:outline-none"
            style={{
              background: `linear-gradient(to right, ${party.color} 0%, ${party.color} ${party.percentage}%, #e2e8f0 ${party.percentage}%, #e2e8f0 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0%</span>
            <span className="text-red-600 font-bold">5% барьер</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Bottom Mandates & Status */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
          <div>
            {passedThreshold ? (
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                Барьер 5% пройден
              </span>
            ) : (
              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                Меньше 5% (нет мандатов)
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-slate-500 text-xs">Мандаты:</span>
            <span
              className="font-extrabold text-base"
              style={{ color: passedThreshold ? party.color : '#94A3B8' }}
            >
              {seats}
            </span>
            <span className="text-slate-400 text-xs">
              / {totalSeats} ({totalSeats > 0 ? ((seats / totalSeats) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
