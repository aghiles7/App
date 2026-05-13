/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { tollingFacts, countriesData, TollingFact, TollingTechnology } from './data/tollData';
import { WorldMap } from './components/WorldMap';
import { KpiGauges } from './components/KpiGauges';
import { DataTable } from './components/DataTable';
import { TimelineChart } from './components/TimelineChart';
import { IntelligenceIndex } from './components/IntelligenceIndex';
import * as XLSX from 'xlsx';
import { 
  Search,
  RefreshCcw, 
  Globe, 
  Activity, 
  Info,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Zap,
  Moon,
  Sun,
  Brain,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { ThemeProvider, useTheme } from './lib/themeContext';

function DashboardContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('Tous');
  const [selectedTech, setSelectedTech] = useState<string>('Toutes');
  const [selectedLLM, setSelectedLLM] = useState<string>('Tous');
  const [selectedDate, setSelectedDate] = useState<string>('Toutes');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleExportExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const filteredData = useMemo(() => {
    return tollingFacts.filter(f => {
      const regionMatch = selectedRegion === 'Tous' || f.region === selectedRegion;
      const techMatch = selectedTech === 'Toutes' || f.tech === selectedTech;
      const llmMatch = selectedLLM === 'Tous' || f.llmStatus === selectedLLM;
      const dateMatch = selectedDate === 'Toutes' || f.date === selectedDate;
      const countryMatch = !selectedCountry || f.country === selectedCountry;
      return regionMatch && techMatch && llmMatch && dateMatch && countryMatch;
    });
  }, [selectedRegion, selectedTech, selectedLLM, selectedDate, selectedCountry]);

  const summaries = useMemo(() => {
    return countriesData.map(c => {
      const countryFacts = filteredData.filter(f => f.country === c.name);
      if (countryFacts.length === 0) return null;
      
      const totalVehicles = countryFacts.reduce((acc, curr) => acc + curr.vehiclesDay, 0);
      const totalReadings = countryFacts.reduce((acc, curr) => acc + curr.readingsOk, 0);
      
      return {
        id: c.id,
        name: c.name,
        region: c.region,
        automation: countryFacts.reduce((acc, curr) => acc + curr.automationRate, 0) / countryFacts.length,
        precision: (totalReadings / totalVehicles) * 100,
        fluidity: countryFacts.reduce((acc, curr) => acc + curr.avgTimeSec, 0) / countryFacts.length,
        volume: totalVehicles / countryFacts.length,
        revenue: countryFacts.reduce((acc, curr) => acc + curr.revenueUsd, 0) / countryFacts.length,
        errors: countryFacts.reduce((acc, curr) => acc + curr.errorRate, 0) / countryFacts.length,
        tech: [c.tech] as TollingTechnology[],
        iaLevel: c.iaLevel,
        electronicAdoption: c.adoption,
        coordinates: c.coords as [number, number]
      };
    }).filter(Boolean);
  }, [filteredData]);

  const globalKpis = useMemo(() => {
    if (filteredData.length === 0) return { precision: 0, fluidity: 0, revenue: 0, errors: 0, techCount: 0 };
    const totalVehicles = filteredData.reduce((acc, curr) => acc + curr.vehiclesDay, 0);
    const totalReadings = filteredData.reduce((acc, curr) => acc + curr.readingsOk, 0);
    const uniqueTechs = new Set(filteredData.map(f => f.tech));
    
    return {
      precision: Number(((totalReadings / totalVehicles) * 100).toFixed(2)),
      fluidity: Number((filteredData.reduce((acc, curr) => acc + curr.avgTimeSec, 0) / filteredData.length).toFixed(2)),
      revenue: Math.round(filteredData.reduce((acc, curr) => acc + curr.revenueUsd, 0) / Array.from(new Set(filteredData.map(f => f.date))).length),
      errors: Number((filteredData.reduce((acc, curr) => acc + curr.errorRate, 0) / filteredData.length).toFixed(2)),
      techCount: uniqueTechs.size,
    };
  }, [filteredData]);

  const currentCountryDetail = useMemo(() => {
    if (!selectedCountry) return null;
    return summaries.find(c => c?.name === selectedCountry) || null;
  }, [selectedCountry, summaries]);

  const timelineData = useMemo(() => {
    const dailyData = Array.from(new Set(filteredData.map(f => f.date))).sort().map(date => {
      const dayFacts = filteredData.filter(f => f.date === date);
      return {
        date,
        volume: dayFacts.reduce((acc, curr) => acc + curr.vehiclesDay, 0),
        revenue: dayFacts.reduce((acc, curr) => acc + curr.revenueUsd, 0)
      };
    });
    return dailyData;
  }, [filteredData]);

  const [activeTab, setActiveTab] = useState<'ops' | 'ai' | 'data'>('ops');

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans selection:bg-blue-500/30",
      isDarkMode ? "bg-[#020617] text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Top Header */}
      <header className={cn(
        "border-b backdrop-blur-md sticky top-0 z-50 transition-colors",
        isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/80"
      )}>
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className={cn(
                "text-lg font-bold tracking-tight uppercase",
                isDarkMode ? "text-slate-100" : "text-slate-900"
              )}>Cyclope Vision<span className="text-blue-600 font-black">AI</span></h1>
              <p className={cn(
                "text-xs font-mono flex items-center gap-2",
                isDarkMode ? "text-slate-400" : "text-slate-500"
              )}>
                GLOBAL TOLLING <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" /> LIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={cn(
              "hidden md:flex p-1 rounded-xl items-center gap-1",
              isDarkMode ? "bg-slate-800/50" : "bg-slate-100"
            )}>
              <button
                onClick={() => {
                  setSelectedCountry(null);
                  setActiveTab('ops');
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                  !selectedCountry && activeTab === 'ops'
                    ? (isDarkMode ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white text-blue-600 shadow-sm")
                    : (isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700")
                )}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Vue Globale</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all min-w-[120px] justify-between",
                    selectedCountry && activeTab === 'ops' 
                      ? (isDarkMode ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white text-blue-600 shadow-sm")
                      : (isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700")
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{selectedCountry || "PAYS"}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isCountryMenuOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {isCountryMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className={cn(
                        "absolute top-full left-0 mt-2 w-56 rounded-xl shadow-2xl border overflow-hidden z-[100] backdrop-blur-xl",
                        isDarkMode ? "bg-slate-900/90 border-slate-700" : "bg-white/90 border-slate-200"
                      )}
                    >
                       <div className="p-1.5 max-h-[400px] overflow-y-auto custom-scrollbar">
                          {countriesData.map(c => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSelectedCountry(c.name);
                                setActiveTab('ops');
                                setIsCountryMenuOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between group",
                                selectedCountry === c.name 
                                  ? "text-blue-500 bg-blue-500/10" 
                                  : (isDarkMode ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")
                              )}
                            >
                              {c.name}
                              {selectedCountry === c.name && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                            </button>
                          ))}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[
                { id: 'ai', label: 'Intelligence IA', icon: Brain },
                { id: 'data', label: 'Données', icon: Info },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                    activeTab === tab.id 
                      ? (isDarkMode ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white text-blue-600 shadow-sm")
                      : (isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700")
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={cn("hidden lg:block w-px h-8", isDarkMode ? "bg-slate-800" : "bg-slate-200")} />

            <div className="relative hidden lg:block">
              <div className="relative group">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                  isDarkMode ? "text-slate-500 group-focus-within:text-blue-500" : "text-slate-400 group-focus-within:text-blue-600"
                )} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className={cn(
                    "rounded-full py-1.5 pl-10 pr-4 text-xs w-48 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-500",
                    isDarkMode 
                      ? "bg-slate-800/50 border border-slate-700 text-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20" 
                      : "bg-slate-100 border border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-200"
                  )}
                />
              </div>
            </div>

            <button 
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-all active:scale-95",
                isDarkMode ? "bg-slate-800 text-amber-400 hover:bg-slate-700" : "bg-slate-100 text-blue-600 hover:bg-slate-200"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <div className={cn(
              "p-4 rounded-2xl border backdrop-blur-sm transition-colors",
              isDarkMode ? "bg-slate-900/10 border-slate-800/50" : "bg-white/50 border-slate-200 shadow-sm"
            )}>
               <KpiGauges 
                precision={globalKpis.precision}
                fluidity={globalKpis.fluidity}
                revenue={globalKpis.revenue}
                errors={globalKpis.errors}
                techCount={globalKpis.techCount}
               />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'ops' && (
                <motion.div 
                  key="ops"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <WorldMap 
                      data={summaries as any[]} 
                      onSelectCountry={(c: any) => setSelectedCountry(c.name)} 
                      selectedCountryId={currentCountryDetail?.id}
                      colorBy="precision"
                    />
                    <div className="flex flex-col gap-6">
                      <TimelineChart data={timelineData} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div 
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <IntelligenceIndex data={summaries as any[]} />
                </motion.div>
              )}

              {activeTab === 'data' && (
                <motion.div 
                  key="data"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={() => handleExportExcel(summaries, 'Donnees_Cyclope_Global')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                        isDarkMode ? "bg-slate-800 text-blue-400 hover:bg-slate-700 border border-slate-700" : "bg-white text-blue-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
                      )}
                    >
                      <Download className="w-4 h-4" />
                      Exporter Tout (.xlsx)
                    </button>
                  </div>
                  <DataTable data={summaries as any[]} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="xl:col-span-1">
            <AnimatePresence mode="wait">
              {currentCountryDetail ? (
                <motion.div
                  key={currentCountryDetail.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className={cn(
                    "border rounded-2xl p-6 h-full flex flex-col shadow-sm transition-colors",
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className={cn("text-2xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{currentCountryDetail.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold uppercase border",
                          currentCountryDetail.iaLevel === 'Extrême' ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]" :
                          "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}>
                          IA: {currentCountryDetail.iaLevel}
                        </span>
                        <p className={cn("text-sm flex items-center gap-1.5", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                          <Globe className="w-3 h-3 text-blue-500" /> {currentCountryDetail.region}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedCountry(null)}
                      className={cn("p-2 rounded-lg transition-colors group", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}
                    >
                      <RefreshCcw className={cn("w-4 h-4 text-slate-500 group-hover:text-white transition-colors", isDarkMode ? "" : "text-slate-400 group-hover:text-blue-600")} />
                    </button>
                  </div>

                  <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn("p-4 rounded-xl border", isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200 shadow-sm")}>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Vol. Quotidien</p>
                        <p className={cn("text-lg font-mono font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                          {(currentCountryDetail.volume / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className={cn("p-4 rounded-xl border", isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200 shadow-sm")}>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Adoption</p>
                        <p className={cn("text-lg font-mono font-bold", isDarkMode ? "text-emerald-500" : "text-emerald-600")}>
                          {currentCountryDetail.electronicAdoption}%
                        </p>
                      </div>
                    </div>

                    <div className={cn("p-5 rounded-2xl border transition-all", isDarkMode ? "bg-blue-600/5 border-blue-500/20" : "bg-blue-50 border-blue-100 shadow-sm")}>
                      <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <h3 className={cn("text-sm font-bold uppercase tracking-widest", isDarkMode ? "text-blue-400" : "text-blue-700")}>Statut Architecture</h3>
                      </div>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-0.5">Technologie</p>
                            <p className={cn("text-xs font-bold", isDarkMode ? "text-slate-200" : "text-slate-800")}>{currentCountryDetail.tech[0]}</p>
                          </div>
                          <div className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase border", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-500")}>Réseau</div>
                        </div>
                      </div>
                    </div>

                    {currentCountryDetail.errors > 2.5 && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                          "p-4 rounded-xl border flex gap-3 transition-colors",
                          isDarkMode ? "bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "bg-red-50 border-red-100 shadow-sm"
                        )}
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-red-500 uppercase tracking-tight">Anomalie Détectée</p>
                          <p className={cn("text-xs mt-1 leading-relaxed", isDarkMode ? "text-red-300/80" : "text-red-700")}>
                            Taux d'erreur hors SLA. Calibration nécessaire sur {currentCountryDetail.tech[0]}.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className={cn("mt-8 pt-6 border-t transition-colors", isDarkMode ? "border-slate-800" : "border-slate-100")}>
                    <button 
                      onClick={() => handleExportExcel([currentCountryDetail], `Rapport_${currentCountryDetail.name}`)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-sm shadow-lg shadow-blue-500/30"
                    >
                      Télécharger Données Excel <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-4 leading-normal italic uppercase font-bold">
                      Dernière mise à jour : 12 mai 2026<br/>Source : Cyclope Global Network
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div 
                  className={cn(
                    "border border-dashed rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center transition-colors",
                    isDarkMode ? "bg-slate-900/30 border-slate-700" : "bg-slate-50 border-slate-300"
                  )}
                >
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-6 mt-20 transition-colors", isDarkMode ? "bg-slate-800" : "bg-white shadow-sm")}>
                    <Globe className={cn("w-8 h-8", isDarkMode ? "text-slate-600" : "text-slate-300")} />
                  </div>
                  <h3 className={cn("text-lg font-bold mb-2", isDarkMode ? "text-slate-400" : "text-slate-600")}>Sélectionnez un Pays</h3>
                  <p className={cn("text-sm max-w-[200px]", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                    Cliquez sur une bulle de la carte pour afficher l'analyse détaillée et les projections.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </main>

      <footer className={cn("border-t py-8 px-6 mt-12 transition-colors", isDarkMode ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-slate-100/50")}>
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono uppercase tracking-[0.2em] font-black underline decoration-blue-500/50 underline-offset-4">
            <Activity className="w-4 h-4 text-blue-500" /> Global Smart Tolling Dashboard
          </div>
          <p className="text-slate-500 text-xs font-mono font-black border-l-2 border-blue-500 pl-4">
            &copy; 2026 CYCLOPE VISION AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
