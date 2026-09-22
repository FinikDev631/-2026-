import React, { useState, useMemo, useRef } from 'react';
import { Party, PresetScenario } from './types';
import { INITIAL_PARTIES, PRESET_SCENARIOS } from './data/defaultParties';
import { calculateDumaSeats } from './utils/electoralCalculations';
import { exportToJsonFile, exportToPrintPdf, ElectionExportData } from './utils/exportUtils';
import { PartyCard } from './components/PartyCard';
import { TotalDistributionBar } from './components/TotalDistributionBar';
import { ParliamentChart } from './components/ParliamentChart';
import { ParliamentSummary } from './components/ParliamentSummary';
import { ImageCustomizerModal } from './components/ImageCustomizerModal';
import { AddPartyModal } from './components/AddPartyModal';
import { Plus, FileText, Download, Upload, Check } from 'lucide-react';

export default function App() {
  const [parties, setParties] = useState<Party[]>(INITIAL_PARTIES);
  const [autoBalance, setAutoBalance] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('duma-2026-base');
  const [proportionalOnly, setProportionalOnly] = useState<boolean>(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [selectedPartyForImage, setSelectedPartyForImage] = useState<Party | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);

  // Total Percentage
  const totalPercentage = useMemo(() => {
    return parties.reduce((sum, p) => sum + p.percentage, 0);
  }, [parties]);

  // Parliamentary Seats
  const totalSeats = proportionalOnly ? 225 : 450;
  const seatCalculation = useMemo(() => {
    return calculateDumaSeats(parties, totalSeats, proportionalOnly);
  }, [parties, totalSeats, proportionalOnly]);

  // Handle changing party percentage with smart auto-balancing
  const handlePercentageChange = (id: string, newPercentage: number) => {
    setActivePresetId(null);
    const targetParty = parties.find((p) => p.id === id);
    if (!targetParty) return;

    if (!autoBalance) {
      setParties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, percentage: newPercentage } : p))
      );
      return;
    }

    // Auto-balance mode
    const otherParties = parties.filter((p) => p.id !== id);
    const unlockedOthers = otherParties.filter((p) => !p.isLocked);
    const lockedSum = parties
      .filter((p) => p.id !== id && p.isLocked)
      .reduce((sum, p) => sum + p.percentage, 0);

    const clampedNew = Math.max(0, Math.min(100 - lockedSum, newPercentage));
    const remainingForUnlocked = Math.max(0, 100 - lockedSum - clampedNew);
    const currentUnlockedSum = unlockedOthers.reduce((sum, p) => sum + p.percentage, 0);

    setParties((prev) => {
      return prev.map((p) => {
        if (p.id === id) {
          return { ...p, percentage: Math.round(clampedNew * 10) / 10 };
        }
        if (p.isLocked) {
          return p;
        }
        if (unlockedOthers.length === 0) {
          return p;
        }

        let newShare = 0;
        if (currentUnlockedSum > 0) {
          newShare = (p.percentage / currentUnlockedSum) * remainingForUnlocked;
        } else {
          newShare = remainingForUnlocked / unlockedOthers.length;
        }
        return { ...p, percentage: Math.round(newShare * 10) / 10 };
      });
    });
  };

  const handleToggleLock = (id: string) => {
    setParties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isLocked: !p.isLocked } : p))
    );
  };

  const handleBalanceTo100 = () => {
    const lockedParties = parties.filter((p) => p.isLocked);
    const unlockedParties = parties.filter((p) => !p.isLocked);

    const lockedSum = lockedParties.reduce((sum, p) => sum + p.percentage, 0);
    const targetUnlockedSum = Math.max(0, 100 - lockedSum);
    const currentUnlockedSum = unlockedParties.reduce((sum, p) => sum + p.percentage, 0);

    if (unlockedParties.length === 0) return;

    setParties((prev) => {
      return prev.map((p) => {
        if (p.isLocked) return p;
        let newPct = 0;
        if (currentUnlockedSum > 0) {
          newPct = (p.percentage / currentUnlockedSum) * targetUnlockedSum;
        } else {
          newPct = targetUnlockedSum / unlockedParties.length;
        }
        return { ...p, percentage: Math.round(newPct * 10) / 10 };
      });
    });
  };

  const handleSelectPreset = (preset: PresetScenario) => {
    setActivePresetId(preset.id);
    setParties((prev) => {
      return prev.map((p) => {
        const presetPct = preset.parties[p.id];
        return {
          ...p,
          percentage: typeof presetPct === 'number' ? presetPct : 0,
        };
      });
    });
  };

  const handleResetAll = () => {
    setParties(INITIAL_PARTIES);
    setActivePresetId('duma-2026-base');
  };

  const handleImageUpload = (id: string, imageData: string) => {
    setParties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, customImage: imageData } : p))
    );
  };

  const handleResetImage = (id: string) => {
    setParties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, customImage: null } : p))
    );
  };

  const handleAddParty = (newParty: Party) => {
    setParties((prev) => [...prev, newParty]);
  };

  // Export handlers
  const handleExportPdf = () => {
    exportToPrintPdf(
      parties,
      seatCalculation.results,
      totalSeats,
      proportionalOnly,
      seatCalculation.majorityParty,
      seatCalculation.hasConstitutionalMajority,
      seatCalculation.hasSimpleMajority
    );
  };

  const handleExportJson = () => {
    exportToJsonFile(
      parties,
      seatCalculation.results,
      totalSeats,
      proportionalOnly,
      seatCalculation.majorityParty,
      seatCalculation.hasConstitutionalMajority,
      seatCalculation.hasSimpleMajority
    );
  };

  // Import JSON handler
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as ElectionExportData;
        if (!parsed.parties || !Array.isArray(parsed.parties)) {
          throw new Error('Некорректная структура файла JSON');
        }

        setParties((current) => {
          return current.map((p) => {
            const imported = parsed.parties.find((item) => item.id === p.id);
            if (imported) {
              return {
                ...p,
                percentage: typeof imported.percentage === 'number' ? imported.percentage : p.percentage,
              };
            }
            return p;
          });
        });

        setActivePresetId(null);
        setImportNotice('Расчет успешно загружен из JSON');
        setTimeout(() => setImportNotice(null), 3000);
      } catch (err) {
        alert('Ошибка при чтении файла JSON. Убедитесь, что выбран корректный файл расчета.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
              Государственная Дума Федерального Собрания РФ
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
              Выборы 2026: Калькулятор процентов партий
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export PDF Button */}
            <button
              type="button"
              id="header-export-pdf-btn"
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-xs"
              title="Сформировать PDF документ для печати или сохранения"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Экспорт в PDF</span>
            </button>

            {/* Export JSON Button */}
            <button
              type="button"
              id="header-export-json-btn"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-xs"
              title="Сохранить текущие расчеты в файл JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Экспорт JSON</span>
            </button>

            {/* Import JSON Button */}
            <button
              type="button"
              id="header-import-json-btn"
              onClick={() => jsonFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-xs"
              title="Загрузить ранее сохраненный расчет из файла JSON"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Загрузить JSON</span>
            </button>
            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleJsonImport}
            />

            {/* Add Custom Party */}
            <button
              type="button"
              id="add-party-btn"
              onClick={() => setIsAddPartyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить партию</span>
            </button>
          </div>
        </div>
      </header>

      {/* Import Notification Toast */}
      {importNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-md">
          <Check className="w-4 h-4" />
          <span>{importNotice}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Total Distribution & Presets Bar */}
        <TotalDistributionBar
          parties={parties}
          totalPercentage={totalPercentage}
          presets={PRESET_SCENARIOS}
          activePresetId={activePresetId}
          autoBalance={autoBalance}
          onToggleAutoBalance={() => setAutoBalance(!autoBalance)}
          onBalanceTo100={handleBalanceTo100}
          onSelectPreset={handleSelectPreset}
          onResetAll={handleResetAll}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Party Sliders (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-semibold uppercase tracking-wider">
              <span>Кандидаты и избирательные списки (Выборы 2026)</span>
              <span>Избирательный барьер: 5.0%</span>
            </div>

            <div className="flex flex-col gap-3">
              {parties.map((party) => {
                const partyResult = seatCalculation.results.find((r) => r.partyId === party.id);
                return (
                  <PartyCard
                    key={party.id}
                    party={party}
                    seats={partyResult?.seats || 0}
                    totalSeats={totalSeats}
                    passedThreshold={party.percentage >= 5.0}
                    onPercentageChange={handlePercentageChange}
                    onToggleLock={handleToggleLock}
                    onImageUpload={handleImageUpload}
                    onResetImage={handleResetImage}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Column: Duma Diagram & Results Table (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-20">
            {/* Duma Visualization */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col items-center shadow-xs">
              <div className="flex items-center justify-between w-full pb-2 mb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-sm">
                  Зал пленарных заседаний (Госдума 2026)
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  Всего: {totalSeats} мест
                </span>
              </div>

              <ParliamentChart
                results={seatCalculation.results}
                totalSeats={totalSeats}
              />
            </div>

            {/* Results Table */}
            <ParliamentSummary
              results={seatCalculation.results}
              parties={parties}
              totalSeats={totalSeats}
              proportionalOnly={proportionalOnly}
              onToggleProportionalOnly={setProportionalOnly}
              majorityParty={seatCalculation.majorityParty}
              hasConstitutionalMajority={seatCalculation.hasConstitutionalMajority}
              hasSimpleMajority={seatCalculation.hasSimpleMajority}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Калькулятор прогноза «Выборы 2026» в Государственную Думу РФ</span>
          <span className="text-slate-400">Федеральный закон «О выборах депутатов Государственной Думы»</span>
        </div>
      </footer>

      {/* Image Customizer Modal */}
      <ImageCustomizerModal
        party={selectedPartyForImage}
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedPartyForImage(null);
        }}
        onSaveImage={handleImageUpload}
        onResetImage={handleResetImage}
      />

      {/* Add Custom Party Modal */}
      <AddPartyModal
        isOpen={isAddPartyOpen}
        onClose={() => setIsAddPartyOpen(false)}
        onAddParty={handleAddParty}
      />
    </div>
  );
}
