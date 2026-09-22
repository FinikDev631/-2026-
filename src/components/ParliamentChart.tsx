import React, { useMemo, useState } from 'react';
import { SeatDistributionResult } from '../utils/electoralCalculations';

interface ParliamentChartProps {
  results: SeatDistributionResult[];
  totalSeats: number;
}

interface SeatDot {
  x: number;
  y: number;
  partyId: string;
  color: string;
  partyName: string;
}

export const ParliamentChart: React.FC<ParliamentChartProps> = ({ results, totalSeats }) => {
  const [hoveredParty, setHoveredParty] = useState<SeatDistributionResult | null>(null);

  // Generate hemicycle dots
  const seatDots = useMemo(() => {
    const dots: SeatDot[] = [];
    const qualifying = results.filter((r) => r.seats > 0);

    if (qualifying.length === 0) return dots;

    // Number of concentric rows in the hemicycle
    const numRows = totalSeats > 300 ? 9 : 6;
    const innerRadius = 70;
    const outerRadius = 160;
    const centerX = 200;
    const centerY = 190;

    // Distribute seats among rows proportionally to circumference
    const rowRadii: number[] = [];
    let totalCircumference = 0;
    for (let r = 0; r < numRows; r++) {
      const radius = innerRadius + (r / (numRows - 1)) * (outerRadius - innerRadius);
      rowRadii.push(radius);
      totalCircumference += radius * Math.PI;
    }

    const rowSeatCounts: number[] = [];
    let allocatedSeats = 0;
    for (let r = 0; r < numRows; r++) {
      const share = (rowRadii[r] * Math.PI) / totalCircumference;
      let count = Math.round(share * totalSeats);
      if (r === numRows - 1) {
        count = totalSeats - allocatedSeats;
      }
      rowSeatCounts.push(count);
      allocatedSeats += count;
    }

    // Build ordered list of party assignments for every single seat
    const seatAssignments: { partyId: string; color: string; partyName: string }[] = [];
    qualifying.forEach((party) => {
      for (let i = 0; i < party.seats; i++) {
        seatAssignments.push({
          partyId: party.partyId,
          color: party.color,
          partyName: party.partyName,
        });
      }
    });

    // Fill the dots row by row from left to right (pi to 0 radians)
    let currentSeatIdx = 0;
    for (let r = 0; r < numRows; r++) {
      const radius = rowRadii[r];
      const count = rowSeatCounts[r];
      if (count <= 0) continue;

      for (let c = 0; c < count; c++) {
        if (currentSeatIdx >= seatAssignments.length) break;
        const angle = Math.PI - (c / (count - 1 || 1)) * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * Math.sin(angle);

        const assignment = seatAssignments[currentSeatIdx];
        dots.push({
          x,
          y,
          partyId: assignment.partyId,
          color: assignment.color,
          partyName: assignment.partyName,
        });

        currentSeatIdx++;
      }
    }

    return dots;
  }, [results, totalSeats]);

  const simpleMajoritySeats = Math.floor(totalSeats / 2) + 1;
  const constitutionalMajoritySeats = Math.ceil((totalSeats * 2) / 3);

  return (
    <div id="parliament-chart-container" className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[440px] aspect-[400/220] flex items-center justify-center">
        <svg viewBox="0 0 400 215" className="w-full h-full drop-shadow-xs select-none">
          {/* Background arch guidelines */}
          <path
            d="M 40 190 A 160 160 0 0 1 360 190"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d="M 130 190 A 70 70 0 0 1 270 190"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Simple majority indicator line at 90 degrees (middle) */}
          <line
            x1="200"
            y1="190"
            x2="200"
            y2="20"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Seat dots */}
          {seatDots.map((dot, idx) => {
            const isHovered = hoveredParty?.partyId === dot.partyId;
            const isOtherHovered = hoveredParty && !isHovered;

            return (
              <circle
                key={idx}
                cx={dot.x}
                cy={dot.y}
                r={totalSeats > 300 ? 3.5 : 4.5}
                fill={dot.color}
                opacity={isOtherHovered ? 0.25 : 1}
                stroke={isHovered ? '#1E293B' : 'none'}
                strokeWidth={isHovered ? 1.5 : 0}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Center Podest / Speaker Text */}
          <circle cx="200" cy="188" r="18" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <text
            x="200"
            y="192"
            textAnchor="middle"
            fill="#334155"
            fontSize="10"
            fontWeight="800"
          >
            {totalSeats}
          </text>
        </svg>

        {/* Floating tooltip/center badge when hovering */}
        <div className="absolute bottom-1 text-center pointer-events-none">
          {hoveredParty ? (
            <div className="px-3 py-1 bg-slate-900/90 backdrop-blur-xs text-white rounded-full text-xs font-medium shadow-md">
              <span className="font-bold">{hoveredParty.partyName}:</span>{' '}
              {hoveredParty.seats} мест ({hoveredParty.seatPercentage.toFixed(1)}%)
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 font-medium">
              Амфитеатр Государственной Думы РФ
            </div>
          )}
        </div>
      </div>

      {/* Majority Reference Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
          <span>Простое большинство: <strong>{simpleMajoritySeats}</strong> мест</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Конституционное 2/3: <strong>{constitutionalMajoritySeats}</strong> мест</span>
        </div>
      </div>

      {/* Seats Summary Chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-3 w-full">
        {results
          .filter((r) => r.seats > 0)
          .map((r) => (
            <button
              key={r.partyId}
              id={`seat-chip-${r.partyId}`}
              onMouseEnter={() => setHoveredParty(r)}
              onMouseLeave={() => setHoveredParty(null)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                hoveredParty?.partyId === r.partyId
                  ? 'border-slate-800 shadow-xs scale-105'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-slate-700">{r.shortName}:</span>
              <span className="font-bold" style={{ color: r.color }}>
                {r.seats} мест
              </span>
              <span className="text-slate-500 text-[10px]">
                ({r.seatPercentage.toFixed(1)}%)
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};
