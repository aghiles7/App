/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { useTheme } from '../lib/themeContext';
import { cn } from '../lib/utils';
import { Brain, TrendingUp } from 'lucide-react';

interface IntelligenceIndexProps {
  data: any[];
}

const IA_LEVEL_MAP: Record<string, number> = {
  'Intermédiaire': 40,
  'Moyen': 55,
  'Avancé': 70,
  'Très avancé': 85,
  'Extrême': 100
};

export const IntelligenceIndex: React.FC<IntelligenceIndexProps> = ({ data }) => {
  const { isDarkMode } = useTheme();

  const chartData = data.map(country => ({
    name: country.name,
    score: IA_LEVEL_MAP[country.iaLevel] || 0,
    iaLevel: country.iaLevel,
    tech: country.tech[0]
  })).sort((a, b) => b.score - a.score);

  return (
    <div className={cn(
      "p-6 rounded-2xl border h-[500px] flex flex-col transition-colors",
      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
    )}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className={cn("text-lg font-bold uppercase tracking-widest flex items-center gap-2", isDarkMode ? "text-slate-200" : "text-slate-800")}>
            Indice de Maturité IA Global
          </h3>
          <p className={cn("text-xs uppercase font-bold tracking-tighter mt-1", isDarkMode ? "text-slate-500" : "text-slate-400")}>
            Évaluation basée sur le déploiement Vision & LLM
          </p>
        </div>
        <div className={cn(
          "p-2 rounded-lg",
          isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
        )}>
          <Brain className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            barSize={56}
          >
            <defs>
              <linearGradient id="iaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12, fontWeight: 'mono' }}
            />
            <Tooltip
              cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc', radius: 4 }}
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                borderColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
              labelStyle={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '8px', fontWeight: 'black', fontSize: '14px', textTransform: 'uppercase' }}
              formatter={(value: number, name: string, props: any) => [
                <div key="score" className="flex flex-col gap-1">
                  <span className="text-blue-500 font-mono text-lg">{value}/100</span>
                  <span className="text-sm text-slate-400 capitalize">Niveau: {props.payload.iaLevel}</span>
                  <span className="text-xs text-slate-500 italic mt-1">{props.payload.tech}</span>
                </div>,
                null
              ]}
            />
            <Bar 
              dataKey="score" 
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
            >
              <LabelList 
                dataKey="tech" 
                position="insideTop" 
                offset={20}
                fill={isDarkMode ? "#cbd5e1" : "#64748b"}
                style={{ 
                  fontWeight: '900', 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  pointerEvents: 'none',
                  letterSpacing: '0.05em'
                }}
              />
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="url(#iaGradient)"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-200/10 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vision IA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generative IA</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-black uppercase tracking-tighter">Mise à jour en direct</span>
        </div>
      </div>
    </div>
  );
};
