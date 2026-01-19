import { Drug } from '@/types';

export const drugs: Drug[] = [
  {
    id: 'cardiostat',
    name: 'CardioStat',
    category: 'Cardiovascular',
    indication: 'Hypertension',
    keyData: 'Phase 3 trials showed 23% greater BP reduction vs. ACE inhibitors, with 40% fewer instances of dry cough',
    competitorName: 'Lisinopril',
    mechanismOfAction: 'Novel calcium channel blocker with dual endothelin receptor antagonism',
  },
  {
    id: 'gluconorm',
    name: 'GlucoNorm XR',
    category: 'Diabetes',
    indication: 'Type 2 Diabetes',
    keyData: 'A1C reduction of 1.4% at 12 weeks, weight-neutral profile, once-daily dosing',
    competitorName: 'Metformin',
    mechanismOfAction: 'GLP-1 receptor agonist with enhanced tissue selectivity',
  },
  {
    id: 'immunex',
    name: 'Immunex Pro',
    category: 'Immunology',
    indication: 'Rheumatoid Arthritis',
    keyData: 'ACR50 response in 62% of patients at week 24, convenient auto-injector, 2-week dosing interval',
    competitorName: 'Humira',
    mechanismOfAction: 'IL-6 inhibitor with modified Fc region for extended half-life',
  },
  {
    id: 'neurocalm',
    name: 'NeuroCalm',
    category: 'CNS',
    indication: 'Generalized Anxiety Disorder',
    keyData: 'HAM-A score reduction of 12.4 points vs 8.2 for placebo at week 8, low discontinuation rate',
    competitorName: 'Lexapro',
    mechanismOfAction: 'Selective serotonin reuptake inhibitor with 5-HT1A partial agonism',
  },
  {
    id: 'oncoshield',
    name: 'OncoShield',
    category: 'Oncology',
    indication: 'Non-Small Cell Lung Cancer',
    keyData: 'Median PFS of 18.9 months vs 10.2 months for standard of care, manageable safety profile',
    competitorName: 'Keytruda',
    mechanismOfAction: 'PD-L1 inhibitor with novel tumor microenvironment modulation',
  },
];

export const getDrugById = (id: string): Drug | undefined => {
  return drugs.find(drug => drug.id === id);
};
