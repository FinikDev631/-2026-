import React, { useState } from 'react';
import { Party } from '../types';
import { X, Plus, Palette } from 'lucide-react';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParty: (newParty: Party) => void;
}

const COLOR_PALETTES = [
  '#2563EB', // Blue
  '#DC2626', // Red
  '#16A34A', // Green
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#0D9488', // Teal
  '#475569', // Slate
];

export const AddPartyModal: React.FC<AddPartyModalProps> = ({
  isOpen,
  onClose,
  onAddParty,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [leader, setLeader] = useState('');
  const [percentage, setPercentage] = useState<number>(3.0);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTES[2]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `custom-${Date.now()}`;
    const newParty: Party = {
      id,
      name: name.trim(),
      shortName: shortName.trim() || name.trim().slice(0, 4).toUpperCase(),
      percentage: Math.max(0, Math.min(100, percentage)),
      color: selectedColor,
      badgeBg: '#F1F5F9',
      textColor: selectedColor,
      customImage: null,
      isLocked: false,
      leader: leader.trim() || undefined,
      description: 'Пользовательская партия / кандидат',
    };

    onAddParty(newParty);
    setName('');
    setShortName('');
    setLeader('');
    setPercentage(3.0);
    onClose();
  };

  return (
    <div
      id="add-party-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Добавить партию или кандидата</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Название партии / ФИО кандидата *
            </label>
            <input
              type="text"
              required
              placeholder="например, Яблоко или Партия Роста"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Краткое обозначение
              </label>
              <input
                type="text"
                placeholder="например, ЯБЛ"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Лидер / представитель
              </label>
              <input
                type="text"
                placeholder="например, Николай Рыбаков"
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Начальный процент голосов: {percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="0.1"
              value={percentage}
              onChange={(e) => setPercentage(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-slate-200 accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>Фирменный цвет партии</span>
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PALETTES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Добавить в список
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
