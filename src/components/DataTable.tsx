/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUpDown, AlertCircle, Database, Cpu, TrendingUp, CheckCircle, DollarSign, Clock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/themeContext';

interface DataTableProps {
  data: any[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const { isDarkMode } = useTheme();
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const columns = [
    { key: 'name', label: 'Pays', icon: <Database className="w-3 h-3" /> },
    { key: 'precision', label: 'Taux Lecture', icon: <CheckCircle className="w-3 h-3" />, unit: '%' },
    { key: 'iaLevel', label: 'Niveau IA', icon: <Cpu className="w-3 h-3" /> },
    { key: 'electronicAdoption', label: 'Adoption Élec.', icon: <TrendingUp className="w-3 h-3" />, unit: '%' },
    { key: 'revenue', label: 'Recettes/J', icon: <DollarSign className="w-3 h-3" />, unit: '$' },
    { key: 'errors', label: 'Erreurs', icon: <AlertCircle className="w-3 h-3" />, unit: '%' },
    { key: 'fluidity', label: 'Fluidité', icon: <Clock className="w-3 h-3" />, unit: 's' },
  ];

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-colors",
      isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
    )}>
      <div className={cn(
        "p-4 border-b transition-colors",
        isDarkMode ? "border-slate-800 bg-slate-800/20" : "border-slate-50 bg-slate-50/50"
      )}>
        <h3 className={cn(
          "text-base font-bold uppercase tracking-widest flex items-center gap-2",
          isDarkMode ? "text-slate-200" : "text-slate-800"
        )}>
          Données Opérationnelles Globales
        </h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className={cn(
            "font-mono text-xs uppercase tracking-wider transition-colors border-b",
            isDarkMode ? "bg-slate-900/60 text-slate-400 border-slate-800" : "bg-slate-50/90 text-slate-500 border-slate-100"
          )}>
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  className={cn("px-6 py-4 cursor-pointer transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")} 
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.icon}
                    {col.label}
                    <ArrowUpDown className={cn("w-3 h-3 opacity-30", sortKey === col.key && "opacity-100")} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn("divide-y transition-colors", isDarkMode ? "divide-slate-800/50" : "divide-slate-100")}>
            {sortedData.map((row) => (
              <tr key={row.id} className={cn("transition-colors group", isDarkMode ? "hover:bg-blue-500/5 text-slate-300" : "hover:bg-slate-50 text-slate-700")}>
                <td className="px-6 py-4 font-bold">
                  {row.name}
                </td>
                <td className="px-6 py-4 font-mono">
                  <span className={cn(row.precision >= 95 ? "text-emerald-500" : "text-amber-500")}>
                    {row.precision.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className={cn(
                     "px-2 py-0.5 rounded text-xs font-bold uppercase border",
                     row.iaLevel === 'Extrême' ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]" :
                     row.iaLevel === 'Très avancé' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                     "bg-slate-500/10 text-slate-400 border-slate-500/20"
                   )}>
                     {row.iaLevel}
                   </span>
                </td>
                <td className="px-6 py-4 font-mono">
                  <span className={cn(row.electronicAdoption >= 95 ? "text-emerald-500" : "text-slate-400")}>
                    {row.electronicAdoption}%
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-blue-500">
                  ${Math.round(row.revenue).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-mono">
                  <span className={cn(row.errors <= 5 ? "text-emerald-500" : "text-red-500")}>
                    {row.errors.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 font-mono">
                  <span className={cn(row.fluidity <= 2 ? "text-emerald-500" : "text-amber-500")}>
                    {row.fluidity.toFixed(2)}s
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
