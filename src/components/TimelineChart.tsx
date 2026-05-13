/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../lib/themeContext';
import { cn } from '../lib/utils';

interface TimelineChartProps {
  data: any[]; // Expecting raw filteredData from App
}

const COUNTRY_COLORS: Record<string, string> = {
  'France': '#3b82f6',    // Blue
  'Allemagne': '#f59e0b', // Amber
  'Pologne': '#ef4444',   // Red
  'Espagne': '#10b981',   // Emerald
  'Inde': '#6366f1',      // Indigo
  'Singapour': '#ec4899', // Pink
  'USA': '#06b6d4',       // Cyan
  'Australie': '#f97316', // Orange
  'Chine': '#a855f7',     // Purple
};

export const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  const { isDarkMode } = useTheme();
  const [metric, setMetric] = useState<'volume' | 'revenue'>('revenue');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { pivotedData, countries } = useMemo(() => {
    const dates = Array.from(new Set(data.map(f => f.date))).sort();
    const countrySet = new Set<string>(data.map(f => f.country));
    const countriesWithSums = Array.from(countrySet).map(country => {
      const sum = data
        .filter(f => f.country === country)
        .reduce((acc, curr) => acc + (metric === 'volume' ? curr.vehiclesDay : curr.revenueUsd), 0);
      return { country, sum };
    });

    const countryList = countriesWithSums
      .sort((a, b) => b.sum - a.sum)
      .map(c => c.country);

    const pivoted = dates.map(date => {
      const dayFacts = data.filter(f => f.date === date);
      const entry: any = { date };
      dayFacts.forEach(f => {
        entry[f.country] = metric === 'volume' ? f.vehiclesDay : f.revenueUsd;
      });
      return entry;
    });

    return { pivotedData: pivoted, countries: countryList };
  }, [data, metric]);

  const chartContent = (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className={cn("font-bold text-lg uppercase tracking-widest transition-colors", isDarkMode ? "text-slate-200" : "text-slate-800")}>Evolution du Trafic & Recettes</h3>
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex rounded-lg p-1 transition-colors",
            isDarkMode ? "bg-slate-800" : "bg-slate-100"
          )}>
            <button
              onClick={() => setMetric('volume')}
              className={cn(
                "px-3 py-1 text-xs uppercase font-bold rounded-md transition-all",
                metric === 'volume' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
              )}
            >
              Volume
            </button>
            <button
              onClick={() => setMetric('revenue')}
              className={cn(
                "px-3 py-1 text-xs uppercase font-bold rounded-md transition-all",
                metric === 'revenue' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                  : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
              )}
            >
              Recettes
            </button>
          </div>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={cn(
              "p-2 rounded-lg transition-all",
              isDarkMode ? "bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-100 text-slate-500 hover:text-slate-800"
            )}
            title={isFullScreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullScreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={isFullScreen ? "85%" : "75%"}>
        <AreaChart data={pivotedData}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            interval={isFullScreen ? 2 : 6}
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
            }}
          />
          <YAxis 
            stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(v) => metric === 'volume' ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e6).toFixed(1)}M$`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              zIndex: 1000,
            }}
            itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
            labelStyle={{ fontSize: '14px', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase', color: isDarkMode ? '#94a3b8' : '#64748b' }}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            }}
            formatter={(value: number, name: string) => [
              `${(value / 1e6).toFixed(2)}M${metric === 'revenue' ? '$' : ''}`, 
              name
            ]}
            itemSorter={(item) => -(item.value as number)}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={48} 
            iconType="circle"
            wrapperStyle={{ 
              fontSize: isFullScreen ? '12px' : '10px', 
              textTransform: 'uppercase', 
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              paddingBottom: '20px'
            }}
          />
          {countries.map((country) => (
            <Area
              key={country}
              type="monotone"
              dataKey={country}
              stackId="1"
              stroke={COUNTRY_COLORS[country] || '#94a3b8'}
              fill={COUNTRY_COLORS[country] || '#94a3b8'}
              fillOpacity={0.4}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );

  return (
    <>
      <div className={cn(
        "h-[400px] w-full p-6 rounded-2xl border transition-colors",
        isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      )}>
        {chartContent}
      </div>

      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed inset-0 z-[9999] p-8 md:p-12 overflow-hidden flex flex-col items-center justify-center backdrop-blur-xl",
              isDarkMode ? "bg-slate-950/90" : "bg-white/90"
            )}
          >
            <div className={cn(
              "w-full h-full p-8 md:p-12 rounded-3xl border shadow-2xl transition-all",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              {chartContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
