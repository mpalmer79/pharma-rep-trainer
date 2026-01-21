import { drugs } from './drugs';
import { personas } from './personas';

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  role: 'Junior Rep' | 'Senior Rep' | 'District Manager' | 'Regional Director';
  region: string;
  territory: string;
  hireDate: string;
  avatar: string;
  status: 'active' | 'on_leave' | 'new_hire';
  manager?: string;
  certifications: string[];
}

export interface RepSession {
  id: string;
  repId: string;
  drugId: string;
  personaId: string;
  completedAt: string;
  duration: number;
  scores: {
    opening: number;
    clinicalKnowledge: number;
    objectionHandling: number;
    timeManagement: number;
    compliance: number;
    closing: number;
  };
  overall: number;
  feedback: {
    strengths: string[];
    improvements: string[];
  };
}

export interface RepStats {
  repId: string;
  totalSessions: number;
  avgScore: number;
  bestScore: number;
  worstScore: number;
  totalTrainingTime: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  streakDays: number;
  lastSessionDate: string;
  scoresByDrug: Record<string, { avg: number; count: number; trend: 'up' | 'down' | 'stable' }>;
  scoresByPersona: Record<string, { avg: number; count: number; trend: 'up' | 'down' | 'stable' }>;
  skillBreakdown: {
    opening: number;
    clinicalKnowledge: number;
    objectionHandling: number;
    timeManagement: number;
    compliance: number;
    closing: number;
  };
  weeklyProgress: { week: string; avgScore: number; sessions: number }[];
  monthlyProgress: { month: string; avgScore: number; sessions: number }[];
}

// 10 Sales Reps with detailed profiles
export const salesReps: SalesRep[] = [
  {
    id: 'rep_001',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@pharmatraining.com',
    role: 'Senior Rep',
    region: 'Northeast',
    territory: 'Boston Metro',
    hireDate: '2021-03-15',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    manager: 'rep_009',
    certifications: ['CardioStat Certified', 'GlucoNorm Specialist', 'Compliance Excellence 2024'],
  },
  {
    id: 'rep_002',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@pharmatraining.com',
    role: 'Junior Rep',
    region: 'Northeast',
    territory: 'NYC Downtown',
    hireDate: '2024-01-08',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'new_hire',
    manager: 'rep_009',
    certifications: ['Onboarding Complete'],
  },
  {
    id: 'rep_003',
    name: 'Emily Chen',
    email: 'emily.chen@pharmatraining.com',
    role: 'Senior Rep',
    region: 'West Coast',
    territory: 'San Francisco Bay',
    hireDate: '2020-06-22',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    manager: 'rep_010',
    certifications: ['OncoShield Expert', 'Immunex Pro Certified', 'Top Performer Q3 2024'],
  },
  {
    id: 'rep_004',
    name: 'David Rodriguez',
    email: 'david.rodriguez@pharmatraining.com',
    role: 'Senior Rep',
    region: 'Southwest',
    territory: 'Phoenix/Tucson',
    hireDate: '2019-11-04',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    manager: 'rep_010',
    certifications: ['NeuroCalm Specialist', 'GlucoNorm Specialist', 'Mentor Certification'],
  },
  {
    id: 'rep_005',
    name: 'Jessica Thompson',
    email: 'jessica.thompson@pharmatraining.com',
    role: 'Junior Rep',
    region: 'Midwest',
    territory: 'Chicago North',
    hireDate: '2023-09-11',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    manager: 'rep_009',
    certifications: ['CardioStat Certified'],
  },
  {
    id: 'rep_006',
    name: 'Robert Kim',
    email: 'robert.kim@pharmatraining.com',
    role: 'Senior Rep',
    region: 'Southeast',
    territory: 'Atlanta Metro',
    hireDate: '2018-04-30',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    manager: 'rep_010',
    certifications: ['All Products Certified', 'Leadership Training Complete', 'President\'s Club 2023'],
  },
  {
    id: 'rep_007',
    name: 'Amanda Foster',
    email: 'amanda.foster@pharmatraining.com',
    role: 'Junior Rep',
    region: 'Northeast',
    territory: 'Philadelphia',
    hireDate: '2024-02-19',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    status: 'new_hire',
    manager: 'rep_009',
    certifications: ['Onboarding Complete', 'CardioStat Certified'],
  },
  {
    id: 'rep_008',
    name: 'Michael Brown',
    email: 'michael.brown@pharmatraining.com',
    role: 'Senior Rep',
    region: 'West Coast',
    territory: 'Los Angeles',
    hireDate: '2020-01-13',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    status: 'on_leave',
    manager: 'rep_010',
    certifications: ['Immunex Pro Certified', 'OncoShield Expert', 'Compliance Excellence 2024'],
  },
  {
    id: 'rep_009',
    name: 'Patricia Williams',
    email: 'patricia.williams@pharmatraining.com',
    role: 'District Manager',
    region: 'Northeast',
    territory: 'Northeast District',
    hireDate: '2016-08-07',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    manager: 'rep_010',
    certifications: ['All Products Certified', 'Management Training', 'Executive Leadership Program'],
  },
  {
    id: 'rep_010',
    name: 'James Anderson',
    email: 'james.anderson@pharmatraining.com',
    role: 'Regional Director',
    region: 'National',
    territory: 'National Accounts',
    hireDate: '2014-02-28',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    certifications: ['All Products Certified', 'Executive Leadership', 'Board Certified Trainer'],
  },
];

// Helper to generate random score within range
const randomScore = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate date string
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Skill profiles for each rep (affects their score generation)
const repSkillProfiles: Record<string, { base: number; variance: number; strengths: string[]; weaknesses: string[] }> = {
  'rep_001': { base: 82, variance: 8, strengths: ['clinicalKnowledge', 'compliance'], weaknesses: ['timeManagement'] },
  'rep_002': { base: 58, variance: 15, strengths: ['opening'], weaknesses: ['objectionHandling', 'closing'] },
  'rep_003': { base: 88, variance: 5, strengths: ['objectionHandling', 'closing', 'clinicalKnowledge'], weaknesses: [] },
  'rep_004': { base: 79, variance: 7, strengths: ['timeManagement', 'opening'], weaknesses: ['compliance'] },
  'rep_005': { base: 68, variance: 12, strengths: ['compliance'], weaknesses: ['clinicalKnowledge', 'objectionHandling'] },
  'rep_006': { base: 91, variance: 4, strengths: ['opening', 'clinicalKnowledge', 'objectionHandling', 'closing'], weaknesses: [] },
  'rep_007': { base: 55, variance: 18, strengths: ['compliance'], weaknesses: ['clinicalKnowledge', 'timeManagement', 'closing'] },
  'rep_008': { base: 76, variance: 9, strengths: ['clinicalKnowledge', 'objectionHandling'], weaknesses: ['opening'] },
  'rep_009': { base: 85, variance: 6, strengths: ['opening', 'closing', 'compliance'], weaknesses: [] },
  'rep_010': { base: 93, variance: 3, strengths: ['opening', 'clinicalKnowledge', 'objectionHandling', 'timeManagement', 'compliance', 'closing'], weaknesses: [] },
};

// Generate scores based on rep's skill profile
const generateScores = (repId: string): RepSession['scores'] => {
  const profile = repSkillProfiles[repId] || { base: 70, variance: 10, strengths: [], weaknesses: [] };
  const skills = ['opening', 'clinicalKnowledge', 'objectionHandling', 'timeManagement', 'compliance', 'closing'] as const;
  
  const scores: Record<string, number> = {};
  skills.forEach(skill => {
    let score = profile.base + randomScore(-profile.variance, profile.variance);
    if (profile.strengths.includes(skill)) score += randomScore(5, 12);
    if (profile.weaknesses.includes(skill)) score -= randomScore(8, 15);
    scores[skill] = Math.min(100, Math.max(0, score));
  });
  
  return scores as RepSession['scores'];
};

// Feedback templates
const strengthTemplates = [
  'Excellent use of clinical data to support key messages',
  'Strong opening that quickly established rapport',
  'Effectively addressed physician concerns with evidence-based responses',
  'Maintained professional demeanor throughout the interaction',
  'Good time management - covered key points efficiently',
  'Demonstrated thorough product knowledge',
  'Successfully navigated objections with confidence',
  'Clear and compelling closing with defined next steps',
  'Showed genuine empathy for patient outcomes',
  'Excellent compliance with regulatory guidelines',
];

const improvementTemplates = [
  'Consider leading with patient outcomes rather than product features',
  'Work on transitioning more smoothly between topics',
  'Practice handling time-pressure scenarios more effectively',
  'Strengthen knowledge of competitor comparisons',
  'Focus on asking more probing questions early in the conversation',
  'Review latest clinical trial data for more specific talking points',
  'Practice handling the skeptical physician persona',
  'Work on creating urgency without being pushy',
  'Improve closing technique - be more specific about next steps',
  'Review compliance guidelines for off-label discussion boundaries',
];

// Generate sessions for a rep
const generateSessionsForRep = (repId: string, count: number): RepSession[] => {
  const sessions: RepSession[] = [];
  const drugIds = drugs.map(d => d.id);
  const personaIds = personas.map(p => p.id);
  
  for (let i = 0; i < count; i++) {
    const scores = generateScores(repId);
    const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6);
    
    // Distribute sessions across past 90 days with some clustering
    const daysBack = Math.floor(Math.random() * 90);
    
    sessions.push({
      id: `session_${repId}_${i}`,
      repId,
      drugId: drugIds[Math.floor(Math.random() * drugIds.length)],
      personaId: personaIds[Math.floor(Math.random() * personaIds.length)],
      completedAt: daysAgo(daysBack),
      duration: randomScore(60, 180),
      scores,
      overall,
      feedback: {
        strengths: [
          strengthTemplates[Math.floor(Math.random() * strengthTemplates.length)],
          strengthTemplates[Math.floor(Math.random() * strengthTemplates.length)],
        ].filter((v, i, a) => a.indexOf(v) === i),
        improvements: [
          improvementTemplates[Math.floor(Math.random() * improvementTemplates.length)],
          improvementTemplates[Math.floor(Math.random() * improvementTemplates.length)],
        ].filter((v, i, a) => a.indexOf(v) === i),
      },
    });
  }
  
  return sessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
};

// Session counts per rep (varies by experience)
const sessionCounts: Record<string, number> = {
  'rep_001': 47,
  'rep_002': 12,
  'rep_003': 63,
  'rep_004': 55,
  'rep_005': 28,
  'rep_006': 89,
  'rep_007': 8,
  'rep_008': 41,
  'rep_009': 34,
  'rep_010': 26,
};

// Generate all sessions
export const allSessions: RepSession[] = salesReps.flatMap(rep => 
  generateSessionsForRep(rep.id, sessionCounts[rep.id] || 20)
);

// Calculate stats for a rep
export const calculateRepStats = (repId: string): RepStats => {
  const repSessions = allSessions.filter(s => s.repId === repId);
  
  if (repSessions.length === 0) {
    return {
      repId,
      totalSessions: 0,
      avgScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalTrainingTime: 0,
      sessionsThisWeek: 0,
      sessionsThisMonth: 0,
      streakDays: 0,
      lastSessionDate: '',
      scoresByDrug: {},
      scoresByPersona: {},
      skillBreakdown: { opening: 0, clinicalKnowledge: 0, objectionHandling: 0, timeManagement: 0, compliance: 0, closing: 0 },
      weeklyProgress: [],
      monthlyProgress: [],
    };
  }
  
  const scores = repSessions.map(s => s.overall);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Calculate scores by drug
  const scoresByDrug: Record<string, { avg: number; count: number; trend: 'up' | 'down' | 'stable' }> = {};
  drugs.forEach(drug => {
    const drugSessions = repSessions.filter(s => s.drugId === drug.id);
    if (drugSessions.length > 0) {
      const avg = Math.round(drugSessions.reduce((a, b) => a + b.overall, 0) / drugSessions.length);
      const recentSessions = drugSessions.slice(0, Math.ceil(drugSessions.length / 2));
      const olderSessions = drugSessions.slice(Math.ceil(drugSessions.length / 2));
      const recentAvg = recentSessions.length > 0 ? recentSessions.reduce((a, b) => a + b.overall, 0) / recentSessions.length : avg;
      const olderAvg = olderSessions.length > 0 ? olderSessions.reduce((a, b) => a + b.overall, 0) / olderSessions.length : avg;
      const trend = recentAvg > olderAvg + 3 ? 'up' : recentAvg < olderAvg - 3 ? 'down' : 'stable';
      scoresByDrug[drug.id] = { avg, count: drugSessions.length, trend };
    }
  });
  
  // Calculate scores by persona
  const scoresByPersona: Record<string, { avg: number; count: number; trend: 'up' | 'down' | 'stable' }> = {};
  personas.forEach(persona => {
    const personaSessions = repSessions.filter(s => s.personaId === persona.id);
    if (personaSessions.length > 0) {
      const avg = Math.round(personaSessions.reduce((a, b) => a + b.overall, 0) / personaSessions.length);
      const recentSessions = personaSessions.slice(0, Math.ceil(personaSessions.length / 2));
      const olderSessions = personaSessions.slice(Math.ceil(personaSessions.length / 2));
      const recentAvg = recentSessions.length > 0 ? recentSessions.reduce((a, b) => a + b.overall, 0) / recentSessions.length : avg;
      const olderAvg = olderSessions.length > 0 ? olderSessions.reduce((a, b) => a + b.overall, 0) / olderSessions.length : avg;
      const trend = recentAvg > olderAvg + 3 ? 'up' : recentAvg < olderAvg - 3 ? 'down' : 'stable';
      scoresByPersona[persona.id] = { avg, count: personaSessions.length, trend };
    }
  });
  
  // Calculate skill breakdown
  const skillBreakdown = {
    opening: Math.round(repSessions.reduce((a, b) => a + b.scores.opening, 0) / repSessions.length),
    clinicalKnowledge: Math.round(repSessions.reduce((a, b) => a + b.scores.clinicalKnowledge, 0) / repSessions.length),
    objectionHandling: Math.round(repSessions.reduce((a, b) => a + b.scores.objectionHandling, 0) / repSessions.length),
    timeManagement: Math.round(repSessions.reduce((a, b) => a + b.scores.timeManagement, 0) / repSessions.length),
    compliance: Math.round(repSessions.reduce((a, b) => a + b.scores.compliance, 0) / repSessions.length),
    closing: Math.round(repSessions.reduce((a, b) => a + b.scores.closing, 0) / repSessions.length),
  };
  
  // Weekly progress (last 8 weeks)
  const weeklyProgress: { week: string; avgScore: number; sessions: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekSessions = repSessions.filter(s => {
      const date = new Date(s.completedAt);
      return date >= weekStart && date < weekEnd;
    });
    weeklyProgress.push({
      week: `W${8 - i}`,
      avgScore: weekSessions.length > 0 ? Math.round(weekSessions.reduce((a, b) => a + b.overall, 0) / weekSessions.length) : 0,
      sessions: weekSessions.length,
    });
  }
  
  // Monthly progress (last 3 months)
  const monthlyProgress: { month: string; avgScore: number; sessions: number }[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 2; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthSessions = repSessions.filter(s => {
      const date = new Date(s.completedAt);
      return date >= monthDate && date < nextMonth;
    });
    monthlyProgress.push({
      month: months[monthDate.getMonth()],
      avgScore: monthSessions.length > 0 ? Math.round(monthSessions.reduce((a, b) => a + b.overall, 0) / monthSessions.length) : 0,
      sessions: monthSessions.length,
    });
  }
  
  // Calculate streak
  let streakDays = 0;
  const sessionDates = new Set(repSessions.map(s => new Date(s.completedAt).toDateString()));
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toDateString();
    if (sessionDates.has(checkDate)) {
      streakDays++;
    } else if (i > 0) {
      break;
    }
  }
  
  return {
    repId,
    totalSessions: repSessions.length,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores),
    totalTrainingTime: repSessions.reduce((a, b) => a + b.duration, 0),
    sessionsThisWeek: repSessions.filter(s => new Date(s.completedAt) >= weekAgo).length,
    sessionsThisMonth: repSessions.filter(s => new Date(s.completedAt) >= monthAgo).length,
    streakDays,
    lastSessionDate: repSessions[0]?.completedAt || '',
    scoresByDrug,
    scoresByPersona,
    skillBreakdown,
    weeklyProgress,
    monthlyProgress,
  };
};

// Pre-calculate all stats
export const allRepStats: Record<string, RepStats> = {};
salesReps.forEach(rep => {
  allRepStats[rep.id] = calculateRepStats(rep.id);
});

// Team-level statistics
export const teamStats = {
  totalReps: salesReps.length,
  activeReps: salesReps.filter(r => r.status === 'active').length,
  totalSessions: allSessions.length,
  avgTeamScore: Math.round(Object.values(allRepStats).reduce((a, b) => a + b.avgScore, 0) / salesReps.length),
  topPerformer: salesReps.reduce((best, rep) => 
    (allRepStats[rep.id]?.avgScore || 0) > (allRepStats[best.id]?.avgScore || 0) ? rep : best
  ),
  mostImproved: salesReps[1], // Marcus - new hire showing improvement
  sessionsThisWeek: Object.values(allRepStats).reduce((a, b) => a + b.sessionsThisWeek, 0),
  sessionsThisMonth: Object.values(allRepStats).reduce((a, b) => a + b.sessionsThisMonth, 0),
  avgSessionsPerRep: Math.round(allSessions.length / salesReps.length),
  certificationRate: Math.round((salesReps.filter(r => r.certifications.length >= 3).length / salesReps.length) * 100),
  complianceAvg: Math.round(Object.values(allRepStats).reduce((a, b) => a + b.skillBreakdown.compliance, 0) / salesReps.length),
};

// Leaderboard
export const leaderboard = salesReps
  .map(rep => ({
    ...rep,
    stats: allRepStats[rep.id],
  }))
  .sort((a, b) => (b.stats?.avgScore || 0) - (a.stats?.avgScore || 0))
  .map((rep, index) => ({ ...rep, rank: index + 1 }));

// Get sessions for a specific rep
export const getRepSessions = (repId: string) => allSessions.filter(s => s.repId === repId);

// Get drug name by ID
export const getDrugName = (drugId: string) => drugs.find(d => d.id === drugId)?.name || drugId;

// Get persona name by ID
export const getPersonaName = (personaId: string) => personas.find(p => p.id === personaId)?.name || personaId;
