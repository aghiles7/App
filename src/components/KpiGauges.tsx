/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Gauge, CheckCircle2, Zap, DollarSign, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { useTheme } from '../lib/themeContext';
import { cn } from '../lib/utils';

interface KpiGaugesProps {
  precision: number; // Read Rate
  fluidity: number;
  revenue: number;
  errors: number;
  techCount: number;
}

export const KpiGauges: React.FC<KpiGaugesProps> = ({ 
  precision, 
  fluidity,
  revenue,
  errors,
  techCount
}) => {
  const { isDarkMode } = useTheme();

  const getStatus = (val: number, type: 'precision' | 'errors' | 'fluidity' | 'tech') => {
    if (type === 'precision') {
      if (val >= 98) return { label: 'Optimal', color: 'emerald' };
      if (val >= 95) return { label: 'Cible', color: 'sky' };
      return { label: 'Critique', color: 'red' };
    }
    if (type === 'tech') {
      if (val >= 4) return { label: 'Diversifié', color: 'emerald' };
      if (val >= 2) return { label: 'Mixe', color: 'sky' };
      return { label: 'Unique', color: 'slate' };
    }
    if (type === 'errors') {
      if (val <= 1) return { label: 'Minimal', color: 'emerald' };
      if (val <= 5) return { label: 'Cible', color: 'sky' };
      return { label: 'Critique', color: 'red' };
    }
    if (type === 'fluidity') {
      if (val < 1.5) return { label: 'Fluide', color: 'emerald' };
      if (val <= 2) return { label: 'Cible', color: 'sky' };
      return { label: 'Lent', color: 'amber' };
    }
    return { label: '--', color: 'slate' };
  };

  const renderMetric = (title: string, value: string | number, unit: string, type: any, icon: React.ReactNode) => {
    const status = getStatus(typeof value === 'number' ? value : 0, type);
    const colorClass = {
      emerald: isDarkMode ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-emerald-600 bg-emerald-50 border-emerald-200',
      sky: isDarkMode ? 'text-sky-400 bg-sky-400/10 border-sky-400/20' : 'text-sky-600 bg-sky-50 border-sky-200',
      amber: isDarkMode ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-amber-600 bg-amber-50 border-amber-200',
      red: isDarkMode ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-red-600 bg-red-50 border-red-200',
      slate: isDarkMode ? 'text-slate-400 bg-slate-400/10 border-slate-400/20' : 'text-slate-600 bg-slate-50 border-slate-200',
    }[status.color];

    return (
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center justify-center min-w-[140px]",
          isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        )}
      >
        <div className={cn("p-2 rounded-lg mb-3 shadow-sm", colorClass)}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
        </div>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</span>
        <div className="flex items-baseline gap-1 mb-2">
          <span className={cn("text-xl font-mono font-bold", isDarkMode ? "text-slate-100" : "text-slate-900")}>
            {value}
          </span>
          <span className="text-sm text-slate-500 font-bold">{unit}</span>
        </div>
        <div className={cn("px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-tighter border", colorClass)}>
          {status.label}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {renderMetric("Taux Lecture", precision, "%", "precision", <CheckCircle2 />)}
      {renderMetric("Technologies", techCount, "Types", "tech", <Zap />)}
      {renderMetric("Revenus/Jour", (revenue / 1000000).toFixed(2), "M$", "revenue", <DollarSign />)}
      {renderMetric("Erreurs", errors, "%", "errors", <AlertCircle />)}
      {renderMetric("Fluidité", fluidity, "s", "fluidity", <Clock />)}
    </div>
  );
};
