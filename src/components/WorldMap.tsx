/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, ZoomOut, Maximize, MousePointer2, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/themeContext';

interface WorldMapProps {
  data: any[];
  onSelectCountry: (country: any) => void;
  selectedCountryId?: string;
  colorBy?: 'automation' | 'precision';
}

export const WorldMap: React.FC<WorldMapProps> = ({ data, onSelectCountry, selectedCountryId, colorBy = 'automation' }) => {
  const { isDarkMode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Projection helpers (approximate)
  const getXY = (lat: number, lng: number) => {
    const x = ((lng + 180) * 800) / 360;
    const y = ((90 - lat) * 400) / 180;
    return { x, y };
  };

  const bubbles = useMemo(() => {
    const maxVolume = Math.max(...data.map(d => d.volume), 1);
    return data.map(country => {
      const { x, y } = getXY(country.coordinates[0], country.coordinates[1]);
      const radius = 5 + (country.volume / maxVolume) * 20;
      
      let color = '#3b82f6'; // blue
      const val = country[colorBy];
      if (val >= 98) color = '#10b981'; // emerald
      else if (val >= 95) color = '#3b82f6'; // blue
      else if (val >= 90) color = '#f59e0b'; // orange
      else color = '#ef4444'; // red

      return {
        ...country,
        x,
        y,
        radius,
        color
      };
    });
  }, [data, colorBy]);

  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [pendingCountry, setPendingCountry] = useState<any | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    const bubbleGroup = target.closest('[data-country-id]');
    if (bubbleGroup) {
      const countryId = bubbleGroup.getAttribute('data-country-id');
      const country = data.find(c => c.id === countryId);
      if (country) {
        setPendingCountry(country);
      }
    } else {
      setPendingCountry(null);
    }

    setIsDragging(true);
    setHasMoved(false);
    setLastPointerPos({ x: e.clientX, y: e.clientY });
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastPointerPos.x;
    const dy = e.clientY - lastPointerPos.y;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setHasMoved(true);
    }

    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    setLastPointerPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const wasDragging = isDragging;
    setIsDragging(false);
    
    if (wasDragging && !hasMoved && pendingCountry) {
      onSelectCountry(pendingCountry);
    }
    
    setPendingCountry(null);
    
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className={cn(
        "relative rounded-2xl border overflow-hidden group select-none touch-none transition-all duration-300",
        isExpanded ? "fixed inset-4 z-[100] shadow-2xl" : "w-full h-[400px]",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      )}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className={cn("font-bold text-xs uppercase tracking-widest transition-colors", isDarkMode ? "text-slate-200" : "text-slate-800")}>
          Carte Mondiale: Automation
        </h3>
        <p className="text-blue-500 text-[9px] font-black mt-1 uppercase">Live Satellite Feeds</p>
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button 
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setScale(prev => Math.min(prev * 1.3, 8)); }}
          className={cn(
            "p-2 rounded-lg border transition-all hover:bg-blue-600 hover:text-white",
            isDarkMode ? "bg-slate-800/90 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
          )}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className={cn(
            "p-2 rounded-lg border transition-all",
            isExpanded ? "bg-red-600 text-white border-red-500" : (isDarkMode ? "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50")
          )}
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button 
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); resetView(); }}
          className={cn(
            "p-2 rounded-lg border transition-all",
            isDarkMode ? "bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-400" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-400"
          )}
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
      
      <svg 
        viewBox="0 0 800 400" 
        className="h-full w-full"
      >
        <g style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, 
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)' 
        }}>
          <path
            d="M150,100 Q200,80 250,110 T350,100 T500,120 T700,90 T750,200 T600,350 T400,380 T200,350 T100,250 Z"
            fill="none"
            stroke={isDarkMode ? "#1e293b" : "#f1f5f9"}
            strokeWidth={1 / scale}
            strokeDasharray={`${4 / scale} ${4 / scale}`}
          />
          
          {bubbles.map((b) => (
            <motion.g
              key={b.id}
              data-country-id={b.id}
              className="cursor-pointer"
            >
              <circle
                cx={b.x}
                cy={b.y}
                r={b.radius}
                fill={b.color}
                fillOpacity={0.6}
                stroke={b.color}
                strokeWidth={selectedCountryId === b.id ? 2 / scale : 0}
                className="transition-all duration-300"
              />
              
              <text
                x={b.x}
                y={b.y - b.radius - 5 / scale}
                textAnchor="middle"
                style={{ fontSize: `${10 / scale}px` }}
                className={cn(
                  "font-mono pointer-events-none transition-all font-bold",
                  selectedCountryId === b.id 
                    ? (isDarkMode ? 'fill-white' : 'fill-slate-900') 
                    : (isDarkMode ? 'fill-slate-500' : 'fill-slate-400')
                )}
              >
                {b.name}
              </text>
            </motion.g>
          ))}
        </g>
      </svg>
    </div>
  );
};
