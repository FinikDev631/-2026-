import React from 'react';

interface PartyLogoProps {
  partyId: string;
  customImage?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  altText?: string;
}

export const PartyLogo: React.FC<PartyLogoProps> = ({
  partyId,
  customImage,
  size = 'md',
  className = '',
  altText = 'Логотип партии',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-16 h-16 rounded-xl',
    xl: 'w-24 h-24 rounded-2xl',
  }[size];

  if (customImage) {
    return (
      <div
        className={`relative overflow-hidden bg-slate-900 border border-slate-300 flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
      >
        <img
          src={customImage}
          alt={altText}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Exact reproduction of user's uploaded images
  switch (partyId) {
    case 'er': // Единая Россия (по загруженному изображению: черный фон, триколор-шлейф, белый медведь, текст ЕДИНАЯ РОССИЯ)
      return (
        <div
          className={`relative overflow-hidden bg-black border border-slate-800 flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
          title="Единая Россия"
        >
          <svg viewBox="0 0 160 210" className="w-full h-full p-1" fill="none">
            {/* Tricolor waving ribbon */}
            <path
              d="M18 52 C50 15 110 18 142 55 C120 40 70 36 28 64 Z"
              fill="#FFFFFF"
            />
            <path
              d="M12 70 C46 36 112 36 148 76 C124 58 68 54 22 84 Z"
              fill="#0055A5"
            />
            <path
              d="M4 94 C44 54 116 54 154 98 C126 80 66 74 14 108 Z"
              fill="#E11D48"
            />
            {/* Bear silhouette - white with blue contour */}
            <g transform="translate(18, 76)">
              {/* Blue shadow/body backing */}
              <path
                d="M10 52 C8 42 16 32 26 28 C34 25 44 32 54 30 C64 28 72 20 86 22 C96 24 104 32 110 38 C116 44 114 54 110 58 C104 54 100 46 92 46 C84 46 80 54 74 54 C68 54 64 48 54 48 C46 48 40 56 32 56 C24 56 16 62 10 52 Z"
                fill="#0055A5"
                stroke="#0055A5"
                strokeWidth="4"
              />
              {/* White bear core */}
              <path
                d="M14 50 C12 42 18 34 28 30 C34 27 42 32 52 30 C62 28 70 22 82 24 C92 26 98 32 104 38 C108 44 106 50 102 54 C98 50 94 44 88 44 C82 44 78 50 72 50 C66 50 62 46 54 46 C46 46 42 52 34 52 C26 52 18 56 14 50 Z"
                fill="#FFFFFF"
              />
            </g>
            {/* Official Text "ЕДИНАЯ РОССИЯ" */}
            <text
              x="80"
              y="164"
              textAnchor="middle"
              fill="#0055A5"
              stroke="#FFFFFF"
              strokeWidth="2"
              paintOrder="stroke fill"
              fontSize="24"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1"
            >
              ЕДИНАЯ
            </text>
            <text
              x="80"
              y="194"
              textAnchor="middle"
              fill="#0055A5"
              stroke="#FFFFFF"
              strokeWidth="2"
              paintOrder="stroke fill"
              fontSize="24"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1"
            >
              РОССИЯ
            </text>
          </svg>
        </div>
      );

    case 'kprf': // КПРФ (по загруженному изображению: красный фон, белый круг с девизом, книга, серп и молот, крупная надпись КПРФ)
      return (
        <div
          className={`relative overflow-hidden bg-[#C8102E] border border-red-700 flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
          title="КПРФ"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full p-1" fill="none">
            {/* Circular text path / motto */}
            <circle cx="100" cy="80" r="54" stroke="#FFFFFF" strokeWidth="2" />
            <path
              id="kprf-circle-path"
              d="M 46 80 A 54 54 0 1 1 154 80 A 54 54 0 1 1 46 80"
              fill="none"
            />
            {/* Open Book */}
            <path
              d="M72 100 C82 96 92 98 100 104 C108 98 118 96 128 100 L128 72 C118 68 108 70 100 76 C92 70 82 68 72 72 Z"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              fill="none"
            />
            <line x1="100" y1="76" x2="100" y2="104" stroke="#FFFFFF" strokeWidth="3" />
            {/* Sickle */}
            <path
              d="M84 94 C104 90 120 74 122 56 C123 48 118 42 112 40 C108 46 112 56 102 68 C96 76 88 82 82 86 Z"
              fill="#FFFFFF"
            />
            {/* Hammer crossing */}
            <line
              x1="76"
              y1="98"
              x2="118"
              y2="52"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <rect
              x="110"
              y="45"
              width="16"
              height="9"
              transform="rotate(45 118 49.5)"
              fill="#FFFFFF"
            />
            {/* Big bold text КПРФ */}
            <text
              x="100"
              y="166"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="44"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="2"
            >
              КПРФ
            </text>
          </svg>
        </div>
      );

    case 'ldpr': // ЛДПР (по загруженному изображению: синий фон с волной, крупные желтые 3D буквы ЛДПР)
      return (
        <div
          className={`relative overflow-hidden bg-[#003399] border border-blue-900 flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
          title="ЛДПР"
        >
          <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
            {/* Soft wave highlights */}
            <path
              d="M0 40 Q80 80 160 30 L160 160 L0 160 Z"
              fill="#002277"
              opacity="0.6"
            />
            <path
              d="M0 100 Q80 140 160 90 L160 160 L0 160 Z"
              fill="#001855"
              opacity="0.8"
            />
            {/* Big 3D Yellow ЛДПР */}
            <text
              x="80"
              y="98"
              textAnchor="middle"
              fill="#D4B000"
              fontSize="48"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1"
            >
              ЛДПР
            </text>
            <text
              x="78"
              y="95"
              textAnchor="middle"
              fill="#FFEE00"
              fontSize="48"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1"
            >
              ЛДПР
            </text>
          </svg>
        </div>
      );

    case 'nl': // Новые люди (по загруженному изображению: бирюзовый гранж-мазок краски, текст ПАРТИЯ и НОВЫЕ ЛЮДИ черным)
      return (
        <div
          className={`relative overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
          title="Новые люди"
        >
          <svg viewBox="0 0 180 140" className="w-full h-full p-0.5" fill="none">
            {/* Turquoise Paint Brush Stroke */}
            <path
              d="M12 60 C30 35 70 20 120 18 C145 18 165 24 168 36 C172 50 150 70 160 88 C166 98 152 110 130 114 C95 120 60 128 35 116 C18 108 8 85 12 60 Z"
              fill="#00C4B4"
            />
            <path
              d="M20 70 C50 48 100 35 155 38 C165 42 160 65 150 80 C130 100 70 115 30 105 Z"
              fill="#00B8A6"
              opacity="0.7"
            />
            {/* "ПАРТИЯ" */}
            <text
              x="90"
              y="46"
              textAnchor="middle"
              fill="#111827"
              fontSize="16"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="3"
            >
              ПАРТИЯ
            </text>
            {/* "НОВЫЕ" */}
            <text
              x="90"
              y="78"
              textAnchor="middle"
              fill="#111827"
              fontSize="28"
              fontWeight="950"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1"
            >
              НОВЫЕ
            </text>
            {/* "ЛЮДИ" */}
            <text
              x="90"
              y="108"
              textAnchor="middle"
              fill="#111827"
              fontSize="28"
              fontWeight="950"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1"
            >
              ЛЮДИ
            </text>
          </svg>
        </div>
      );

    default:
      return (
        <div
          className={`relative overflow-hidden bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
        >
          <span className="text-white font-bold text-xs">ДРУГИЕ</span>
        </div>
      );
  }
};
