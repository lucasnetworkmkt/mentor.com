import React from 'react';
import { getEagleStage } from '../services/gamificationService';

interface EagleBadgeProps {
  points: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EagleBadge: React.FC<EagleBadgeProps> = ({ points, className = "", size = 'md' }) => {
  const stage = getEagleStage(points);

  // Abstract SVG representations for Eagle Stages
  const renderEaglePath = () => {
    switch (stage) {
      case 0: // Initial
        return <path d="M12 12 L4 18 L12 20 L20 18 Z" fill="#444" />;
      case 1: // 1000+
        return (
          <>
            <path d="M12 8 L4 18 L12 20 L20 18 Z" fill="#555" />
            <path d="M12 4 L15 8 L9 8 Z" fill="#9FB4C7" opacity="0.5" />
          </>
        );
      case 2: // 2500+
        return (
           <>
            <path d="M12 8 L2 14 L12 20 L22 14 Z" fill="#333" stroke="#555" />
            <path d="M12 4 L16 8 L8 8 Z" fill="#9FB4C7" />
           </>
        );
      case 3: // 5000+
        return (
            <>
             <path d="M12 6 L1 12 L12 22 L23 12 Z" fill="#222" stroke="#E50914" strokeWidth="0.5" />
             <path d="M12 2 L18 8 L6 8 Z" fill="#9FB4C7" />
            </>
        );
      case 4: // 7500+
        return (
            <>
             <path d="M12 5 L0 10 L12 24 L24 10 Z" fill="#111" stroke="#FFD700" strokeWidth="1" />
             <path d="M12 2 L20 8 L4 8 Z" fill="#E50914" opacity="0.8" />
            </>
        );
      case 5: // 10000
        return (
            <>
             <path d="M12 4 L0 8 L12 24 L24 8 Z" fill="black" />
             <path d="M12 1 L22 7 L2 7 Z" fill="#FFD700" />
             <path d="M0 8 L12 18 L24 8" stroke="#E50914" strokeWidth="1.5" fill="none" />
             <circle cx="12" cy="12" r="1.5" fill="#FFD700" />
            </>
        );
      default:
        return null;
    }
  };

  const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible">
            {renderEaglePath()}
        </svg>
      </div>
    </div>
  );
};

export default EagleBadge;
