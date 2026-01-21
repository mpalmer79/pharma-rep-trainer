'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Award,
  Target,
  ChevronRight,
  BarChart3,
  User,
  Building,
  Mail,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';
import {
  salesReps,
  allRepStats,
  teamStats,
  leaderboard,
  getRepSessions,
  getDrugName,
  getPersonaName,
  SalesRep,
  RepStats,
  RepSession,
} from '@/data/mockTeamData';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';
import RadarChart from '@/components/ui/RadarChart';

interface ManagerDashboardProps {
  onClose: () => void;
}

type Tab = 'overview' | 'leaderboard' | 'reps' | 'analytics';

export default function ManagerDashboard({ onClose }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-red-100';
  };

  const getStatusBadge = (status: SalesRep['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Active</span>;
      case 'new_hire':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">New Hire</span>;
      case 'on_leave':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">On Leave</span>;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Rep Detail View
  const RepDetailView = ({ rep }: { rep: SalesRep }) => {
    const stats = allRepStats[rep.id];
    const sessions = getRepSessions(rep.id).slice(0, 10);

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {/* Back button */}
        <button
          onClick={() => setSelectedRep(null)}
          className="flex items-center gap-2 text-[#1B4D7A] hover:text-[#2D6A9F] font-medium"
        >
          ← Back to Team
        </button>

        {/* Rep Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <img
              src={rep.avatar}
              alt={rep.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-[#1B4D7A]">{rep.name}</h2>
                {getStatusBadge(rep.status)}
              </div>
              <p className="text-gray-600">{rep.role}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {rep.territory}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {rep.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Hired {new Date(rep.hireDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(stats?.avgScore || 0)}`}>
                {stats?.avgScore || 0}
              </div>
              <div className="text-sm text-gray-500">Avg Score</div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-4 flex flex-wrap gap-2">
            {rep.certifications.map((cert, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs rounded-full bg-[#1B4D7A]/10 text-[#1B4D7A] flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-[#1B4D7A]">{stats?.totalSessions || 0}</div>
            <div className="text-sm text-gray-500">Total Sessions</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats?.bestScore || 0}</div>
            <div className="text-sm text-gray-500">Best Score</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-[#E67E22]">{stats?.streakDays || 0}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-[#1B4D7A]">{formatDuration(stats?.totalTrainingTime || 0)}</div>
            <div className="text-sm text-gray-500">Training Time</div>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Skill Breakdown</h3>
          {stats && <RadarChart scores={stats.skillBreakdown} />}
        </div>

        {/* Performance by Drug & Persona */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* By Drug */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Performance by Product</h3>
            <div className="space-y-3">
              {drugs.map(drug => {
                const drugStats = stats?.scoresByDrug[drug.id];
                if (!drugStats) return null;
                return (
                  <div key={drug.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{drug.name}</div>
                      <div className="text-xs text-gray-500">{drugStats.count} sessions</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(drugStats.avg)}`}>
                        {drugStats.avg}
                      </span>
                      {getTrendIcon(drugStats.trend)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Persona */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Performance by Persona</h3>
            <div className="space-y-3">
              {personas.map(persona => {
                const personaStats = stats?.scoresByPersona[persona.id];
                if (!personaStats) return null;
                return (
                  <div key={persona.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{persona.name}</div>
                      <div className="text-xs text-gray-500">{personaStats.count} sessions</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(personaStats.avg)}`}>
                        {personaStats.avg}
                      </span>
                      {getTrendIcon(personaStats.trend)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-800">{getDrugName(session.drugId)}</div>
                  <div className="text-sm text-gray-500">
                    {getPersonaName(session.personaId)} • {formatDate(session.completedAt)}
                  </div>
                </div>
                <div className={`text-xl font-bold ${getScoreColor(session.overall)}`}>
                  {session.overall}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-100 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B4D7A] to-[#2D6A9F] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7" />
                Manager Dashboard
              </h1>
              <p className="text-white/80 mt-1">Team performance analytics powered by Supabase</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {(['overview', 'leaderboard', 'reps', 'analytics'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedRep(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white text-[#1B4D7A]'
                    : 'text-white/80 hover:bg-white/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {selectedRep ? (
              <RepDetailView rep={selectedRep} />
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-500">Active Reps</span>
                        </div>
                        <div className="text-3xl font-bold text-[#1B4D7A]">
                          {teamStats.activeReps}/{teamStats.totalReps}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Target className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-500">Team Avg Score</span>
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(teamStats.avgTeamScore)}`}>
                          {teamStats.avgTeamScore}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-500">Sessions This Week</span>
                        </div>
                        <div className="text-3xl font-bold text-[#1B4D7A]">
                          {teamStats.sessionsThisWeek}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Award className="w-5 h-5 text-amber-600" />
                          </div>
                          <span className="text-sm text-gray-500">Certification Rate</span>
                        </div>
                        <div className="text-3xl font-bold text-[#E67E22]">
                          {teamStats.certificationRate}%
                        </div>
                      </div>
                    </div>

                    {/* Top Performers */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-500" />
                          Top Performer
                        </h3>
                        <div className="flex items-center gap-4">
                          <img
                            src={teamStats.topPerformer.avatar}
                            alt={teamStats.topPerformer.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div>
                            <div className="font-semibold text-lg">{teamStats.topPerformer.name}</div>
                            <div className="text-sm text-gray-500">{teamStats.topPerformer.role}</div>
                            <div className="text-sm text-gray-500">{teamStats.topPerformer.territory}</div>
                          </div>
                          <div className="ml-auto text-right">
                            <div className="text-3xl font-bold text-green-600">
                              {allRepStats[teamStats.topPerformer.id]?.avgScore}
                            </div>
                            <div className="text-sm text-gray-500">Avg Score</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-500" />
                          Most Improved
                        </h3>
                        <div className="flex items-center gap-4">
                          <img
                            src={teamStats.mostImproved.avatar}
                            alt={teamStats.mostImproved.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div>
                            <div className="font-semibold text-lg">{teamStats.mostImproved.name}</div>
                            <div className="text-sm text-gray-500">{teamStats.mostImproved.role}</div>
                            <div className="text-sm text-gray-500">{teamStats.mostImproved.territory}</div>
                          </div>
                          <div className="ml-auto text-right">
                            <div className="text-3xl font-bold text-blue-600 flex items-center gap-1">
                              <TrendingUp className="w-6 h-6" />
                              +12
                            </div>
                            <div className="text-sm text-gray-500">Points this month</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Leaderboard */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[#1B4D7A]">Team Leaderboard</h3>
                        <button
                          onClick={() => setActiveTab('leaderboard')}
                          className="text-sm text-[#1B4D7A] hover:underline flex items-center gap-1"
                        >
                          View All <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {leaderboard.slice(0, 5).map(rep => (
                          <div
                            key={rep.id}
                            onClick={() => setSelectedRep(rep)}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              rep.rank === 1 ? 'bg-amber-100 text-amber-700' :
                              rep.rank === 2 ? 'bg-gray-200 text-gray-700' :
                              rep.rank === 3 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {rep.rank}
                            </div>
                            <img
                              src={rep.avatar}
                              alt={rep.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{rep.name}</div>
                              <div className="text-sm text-gray-500">{rep.territory}</div>
                            </div>
                            <div className={`text-xl font-bold ${getScoreColor(rep.stats?.avgScore || 0)}`}>
                              {rep.stats?.avgScore || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                  <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-[#1B4D7A]">Team Leaderboard</h2>
                      <p className="text-gray-500">Ranked by average training score</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {leaderboard.map(rep => (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedRep(rep)}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            rep.rank === 1 ? 'bg-amber-100 text-amber-700' :
                            rep.rank === 2 ? 'bg-gray-200 text-gray-700' :
                            rep.rank === 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {rep.rank}
                          </div>
                          <img
                            src={rep.avatar}
                            alt={rep.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{rep.name}</span>
                              {getStatusBadge(rep.status)}
                            </div>
                            <div className="text-sm text-gray-500">{rep.role} • {rep.territory}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(rep.stats?.avgScore || 0)}`}>
                              {rep.stats?.avgScore || 0}
                            </div>
                            <div className="text-xs text-gray-500">{rep.stats?.totalSessions} sessions</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Reps Tab */}
                {activeTab === 'reps' && (
                  <motion.div
                    key="reps"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    {salesReps.map(rep => {
                      const stats = allRepStats[rep.id];
                      return (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedRep(rep)}
                          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg cursor-pointer transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={rep.avatar}
                              alt={rep.name}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{rep.name}</span>
                                {getStatusBadge(rep.status)}
                              </div>
                              <div className="text-sm text-gray-500">{rep.role}</div>
                              <div className="text-sm text-gray-500">{rep.territory}</div>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(stats?.avgScore || 0)}`}>
                              {stats?.avgScore || 0}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-[#1B4D7A]">{stats?.totalSessions || 0}</div>
                              <div className="text-xs text-gray-500">Sessions</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">{stats?.bestScore || 0}</div>
                              <div className="text-xs text-gray-500">Best</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-[#E67E22]">{stats?.streakDays || 0}</div>
                              <div className="text-xs text-gray-500">Streak</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Team Skill Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Team Skill Averages</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {(['opening', 'clinicalKnowledge', 'objectionHandling', 'timeManagement', 'compliance', 'closing'] as const).map(skill => {
                          const avg = Math.round(
                            Object.values(allRepStats).reduce((a, b) => a + b.skillBreakdown[skill], 0) / salesReps.length
                          );
                          const labels: Record<string, string> = {
                            opening: 'Opening',
                            clinicalKnowledge: 'Clinical',
                            objectionHandling: 'Objections',
                            timeManagement: 'Time Mgmt',
                            compliance: 'Compliance',
                            closing: 'Closing',
                          };
                          return (
                            <div key={skill} className={`p-4 rounded-xl text-center ${getScoreBg(avg)}`}>
                              <div className={`text-2xl font-bold ${getScoreColor(avg)}`}>{avg}</div>
                              <div className="text-xs text-gray-600 mt-1">{labels[skill]}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Performance by Product */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Team Performance by Product</h3>
                      <div className="space-y-4">
                        {drugs.map(drug => {
                          const avgScore = Math.round(
                            Object.values(allRepStats).reduce((a, b) => {
                              const drugStat = b.scoresByDrug[drug.id];
                              return a + (drugStat?.avg || 0);
                            }, 0) / salesReps.length
                          );
                          const totalSessions = Object.values(allRepStats).reduce((a, b) => {
                            const drugStat = b.scoresByDrug[drug.id];
                            return a + (drugStat?.count || 0);
                          }, 0);
                          return (
                            <div key={drug.id} className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{drug.name}</span>
                                  <span className={`font-bold ${getScoreColor(avgScore)}`}>{avgScore}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      avgScore >= 80 ? 'bg-green-500' :
                                      avgScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${avgScore}%` }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{totalSessions} total sessions</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Performance by Persona */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Team Performance by Persona</h3>
                      <div className="space-y-4">
                        {personas.map(persona => {
                          const avgScore = Math.round(
                            Object.values(allRepStats).reduce((a, b) => {
                              const personaStat = b.scoresByPersona[persona.id];
                              return a + (personaStat?.avg || 0);
                            }, 0) / salesReps.length
                          );
                          const totalSessions = Object.values(allRepStats).reduce((a, b) => {
                            const personaStat = b.scoresByPersona[persona.id];
                            return a + (personaStat?.count || 0);
                          }, 0);
                          return (
                            <div key={persona.id} className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{persona.name}</span>
                                  <span className={`font-bold ${getScoreColor(avgScore)}`}>{avgScore}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      avgScore >= 80 ? 'bg-green-500' :
                                      avgScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${avgScore}%` }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{totalSessions} total sessions • {persona.difficulty} difficulty</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Training Activity Heatmap Preview */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Training Activity Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <div className="text-3xl font-bold text-blue-600">{teamStats.totalSessions}</div>
                          <div className="text-sm text-gray-600">Total Sessions</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl">
                          <div className="text-3xl font-bold text-green-600">{teamStats.sessionsThisMonth}</div>
                          <div className="text-sm text-gray-600">This Month</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                          <div className="text-3xl font-bold text-purple-600">{teamStats.avgSessionsPerRep}</div>
                          <div className="text-sm text-gray-600">Avg per Rep</div>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl">
                          <div className="text-3xl font-bold text-amber-600">{teamStats.complianceAvg}</div>
                          <div className="text-sm text-gray-600">Compliance Avg</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Supabase Badge */}
        <div className="bg-white border-t border-gray-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Powered by</span>
            <span className="font-semibold text-[#3ECF8E]">Supabase</span>
            <span>• Real-time sync • Row Level Security • PostgreSQL</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
