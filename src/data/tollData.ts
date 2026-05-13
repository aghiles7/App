/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TollingTechnology = 'ANPR + RFID' | 'GNSS + OBU' | 'GNSS + ANPR' | 'RFID + ANPR' | 'FASTag RFID + ANPR' | 'GNSS + ERP' | 'E-Tag + ANPR' | 'RFID + IA vidéo';

export interface TollingFact {
  date: string;
  country: string;
  region: string;
  tech: TollingTechnology;
  iaLevel: 'Intermédiaire' | 'Moyen' | 'Avancé' | 'Très avancé' | 'Extrême';
  iaClassification: string;
  llmStatus: string;
  vehiclesDay: number;
  readingsOk: number;
  errorRate: number; // %
  automationRate: number; // %
  precisionRate: number; // %
  revenueUsd: number;
  avgTimeSec: number;
  fraudDetection: boolean;
  realTimeVision: 'Faible' | 'Moyen' | 'Oui' | 'Oui avancée' | 'Oui massive';
  vehicleClassification: 'Oui' | 'Oui avancée' | 'Oui massive';
  predictiveCongestion: 'Faible' | 'Moyen' | 'Oui avancée' | 'Oui massive';
  electronicAdoption: number; // %
  coordinates: [number, number];
}

export interface CountrySummary {
  id: string;
  name: string;
  region: string;
  automation: number;
  precision: number;
  fluidity: number;
  volume: number;
  revenue: number;
  errors: number;
  tech: TollingTechnology[];
  iaLevel: string;
  electronicAdoption: number;
  coordinates: [number, number];
}

export const countriesData = [
  { id: 'france', name: 'France', region: 'Europe', coords: [46.2276, 2.2137], tech: 'ANPR + RFID', ia: 'Oui', llm: 'Expérimental', iaLevel: 'Intermédiaire', fraud: true, vision: 'Moyen', classif: 'Oui', congestion: 'Faible', adoption: 75 },
  { id: 'germany', name: 'Allemagne', region: 'Europe', coords: [51.1657, 10.4515], tech: 'GNSS + OBU', ia: 'Oui', llm: 'Non public', iaLevel: 'Avancé', fraud: true, vision: 'Moyen', classif: 'Oui avancée', congestion: 'Moyen', adoption: 99 },
  { id: 'poland', name: 'Pologne', region: 'Europe', coords: [51.9194, 19.1451], tech: 'GNSS + ANPR', ia: 'Oui', llm: 'Non public', iaLevel: 'Moyen', fraud: true, vision: 'Faible', classif: 'Oui', congestion: 'Faible', adoption: 85 },
  { id: 'spain', name: 'Espagne', region: 'Europe', coords: [40.4168, -3.7038], tech: 'RFID + ANPR', ia: 'Oui', llm: 'Non public', iaLevel: 'Moyen', fraud: true, vision: 'Moyen', classif: 'Oui', congestion: 'Faible', adoption: 88 },
  { id: 'india', name: 'Inde', region: 'Asie', coords: [20.5937, 78.9629], tech: 'FASTag RFID + ANPR', ia: 'Oui', llm: 'Non public', iaLevel: 'Avancé', fraud: true, vision: 'Moyen', classif: 'Oui', congestion: 'Moyen', adoption: 97 },
  { id: 'singapore', name: 'Singapour', region: 'Singapour', coords: [1.3521, 103.8198], tech: 'GNSS + ERP', ia: 'Oui avancée', llm: 'Probable', iaLevel: 'Très avancé', fraud: true, vision: 'Oui avancée', classif: 'Oui', congestion: 'Oui avancée', adoption: 99 },
  { id: 'usa', name: 'USA', region: 'Amérique', coords: [37.0902, -95.7129], tech: 'RFID + ANPR', ia: 'Oui', llm: 'Localement', iaLevel: 'Très avancé', fraud: true, vision: 'Oui', classif: 'Oui', congestion: 'Moyen', adoption: 94 },
  { id: 'australia', name: 'Australie', region: 'Australie', coords: [-25.2744, 133.7751], tech: 'E-Tag + ANPR', ia: 'Oui', llm: 'Non public', iaLevel: 'Très avancé', fraud: true, vision: 'Oui', classif: 'Oui', congestion: 'Moyen', adoption: 98 },
  { id: 'china', name: 'Chine', region: 'Asie', coords: [35.8617, 104.1954], tech: 'RFID + IA vidéo', ia: 'Oui avancée', llm: 'Probable', iaLevel: 'Extrême', fraud: true, vision: 'Oui massive', classif: 'Oui massive', congestion: 'Oui massive', adoption: 99 },
];

export const generateTollingFacts = (): TollingFact[] => {
  const facts: TollingFact[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const baseData: Record<string, any> = {
    'France': { vol: 1500000, read: 1440000, err: 4.0, auto: 88, prec: 96, rev: 18, time: 2.1 },
    'Allemagne': { vol: 2900000, read: 2813000, err: 3.0, auto: 95, prec: 97, rev: 42, time: 1.3 },
    'Pologne': { vol: 1200000, read: 1152000, err: 4.0, auto: 85, prec: 96, rev: 9, time: 1.8 },
    'Espagne': { vol: 1800000, read: 1746000, err: 3.0, auto: 88, prec: 97, rev: 16, time: 1.9 },
    'Inde': { vol: 35000000, read: 34020000, err: 2.8, auto: 94, prec: 97.2, rev: 85, time: 1.4 },
    'Singapour': { vol: 950000, read: 940500, err: 1.0, auto: 99, prec: 99, rev: 7, time: 0.8 },
    'USA': { vol: 18000000, read: 17460000, err: 3.0, auto: 95, prec: 97, rev: 110, time: 1.5 },
    'Australie': { vol: 3500000, read: 3451000, err: 1.4, auto: 98, prec: 98.6, rev: 28, time: 1.0 },
    'Chine': { vol: 60000000, read: 59400000, err: 1.0, auto: 99, prec: 99, rev: 210, time: 0.7 },
  };

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    countriesData.forEach(c => {
      const base = baseData[c.name];
      const variance = (Math.random() * 0.05) + 0.975; // Smaller variance for "exact" figures
      const vehicles = Math.floor(base.vol * variance);
      
      facts.push({
        date: dateStr,
        country: c.name,
        region: c.region,
        tech: c.tech as TollingTechnology,
        iaLevel: c.iaLevel as any,
        iaClassification: c.ia,
        llmStatus: c.llm,
        vehiclesDay: vehicles,
        readingsOk: Math.floor(vehicles * (base.prec / 100)),
        errorRate: base.err,
        automationRate: base.auto,
        precisionRate: base.prec,
        revenueUsd: base.rev * 1000000 * variance,
        avgTimeSec: base.time,
        fraudDetection: c.fraud,
        realTimeVision: c.vision as any,
        vehicleClassification: c.classif as any,
        predictiveCongestion: c.congestion as any,
        electronicAdoption: c.adoption,
        coordinates: c.coords as [number, number]
      });
    });
  }
  return facts;
};

export const tollingFacts = generateTollingFacts();

export const countrySummaries: CountrySummary[] = countriesData.map(c => {
  const f = tollingFacts.find(fact => fact.country === c.name && fact.date === tollingFacts[tollingFacts.length-1].date)!;
  return {
    id: c.id,
    name: c.name,
    region: c.region,
    automation: f.automationRate,
    precision: f.precisionRate,
    fluidity: f.avgTimeSec,
    volume: f.vehiclesDay,
    revenue: f.revenueUsd,
    errors: f.errorRate,
    tech: [c.tech] as TollingTechnology[],
    iaLevel: c.iaLevel,
    electronicAdoption: c.adoption,
    coordinates: c.coords as [number, number]
  };
});


