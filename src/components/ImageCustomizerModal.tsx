import React, { useState } from 'react';
import { Party } from '../types';
import { PartyLogo } from './PartyLogo';
import { X, Upload, Link, RotateCcw, Check, Image as ImageIcon } from 'lucide-react';

interface ImageCustomizerModalProps {
  party: Party | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveImage: (partyId: string, imageUrl: string) => void;
  onResetImage: (partyId: string) => void;
}

export const ImageCustomizerModal: React.FC<ImageCustomizerModalProps> = ({
  party,
  isOpen,
  onClose,
  onSaveImage,
  onResetImage,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [previewError, setPreviewError] = useState(false);

  if (!isOpen || !party) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSaveImage(party.id, reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onSaveImage(party.id, urlInput.trim());
      setUrlInput('');
      onClose();
    }
  };

  return (
    <div
      id="image-customizer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Изображение для {party.name}</h3>
              <p className="text-xs text-slate-500">Загрузите свой файл или укажите прямую ссылку</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* Current Picture Preview */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <PartyLogo
              partyId={party.id}
              customImage={party.customImage}
              size="lg"
              altText={party.name}
            />
            <div className="flex-1">
              <span className="text-xs font-semibold text-slate-500 block">Текущее изображение:</span>
              <span className="text-sm font-bold text-slate-800">
                {party.customImage ? 'Пользовательское изображение' : 'Официальная векторная символика'}
              </span>
              {party.customImage && (
                <button
                  type="button"
                  onClick={() => {
                    onResetImage(party.id);
                    onClose();
                  }}
                  className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Вернуть стандартный логотип</span>
                </button>
              )}
            </div>
          </div>

          {/* Option 1: Upload File */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700">Вариант 1: Загрузить файл с устройства</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-4 cursor-pointer hover:bg-slate-50/80 transition-all">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Нажмите для выбора файла</span>
              <span className="text-[11px] text-slate-400">PNG, JPG, SVG или WebP до 5 МБ</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Option 2: Image URL */}
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700">Вариант 2: Вставить ссылку на картинку</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Применить
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
