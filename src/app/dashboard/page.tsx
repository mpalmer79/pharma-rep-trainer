'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface SessionStats {
  totalSessions: number;
  avgScore: number;
  totalTime: number;
  completedToday: number;
  streak: number;
  lastSessionDate: string | null;
}

interface RecentSession {
  id: string;
  drug: string;
  persona: string;
  score: number;
  duration: number;
  completedAt: string;
}

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    avgScore: 0,
    totalTime: 0,
    completedToday: 0,
    streak: 0,
    lastSessionDate: null,
  });
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoadingStats(true);
    try {
      // Load from localStorage for now (will integrate with Supabase later)
      const savedSessions = localStorage.getItem(`pharma_sessions_${user?.id}`);
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        
        // Calculate stats
        const today = new Date().toDateString();
        const completedToday = sessions.filter((s: RecentSession) => 
          new Date(s.completedAt).toDateString() === today
        ).length;
        
        const totalScore = sessions.reduce((acc: number, s: RecentSession) => acc + s.score, 0);
        const totalTime = sessions.reduce((acc: number, s: RecentSession) => acc + s.duration, 0);
        
        setStats({
          totalSessions: sessions.length,
          avgScore: sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0,
          totalTime: totalTime,
          completedToday,
          streak: calculateStreak(sessions),
          lastSessionDate: sessions.length > 0 ? sessions[0].completedAt : null,
        });
        
        setRecentSessions(sessions.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const calculateStreak = (sessions: RecentSession[]): number => {
    if (sessions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      const hasSession = sessions.some(s => 
        new Date(s.completedAt).toDateString() === dateStr
      );
      
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4D7A]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-[#1B4D7A]">
                RepIQ
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="text-gray-600 hover:text-[#1B4D7A] transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="text-gray-600 hover:text-[#1B4D7A] transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Track your progress and continue your training journey.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingStats ? '...' : stats.totalSessions}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>
                  {loadingStats ? '...' : `${stats.avgScore}%`}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Training Time</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingStats ? '...' : formatDuration(stats.totalTime)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Day Streak</p>
                <p className="text-3xl font-bold text-orange-600">
                  {loadingStats ? '...' : `${stats.streak} 🔥`}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/?start=true"
            className="bg-gradient-to-r from-[#1B4D7A] to-[#2A6A9E] text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Start Training</h3>
            <p className="text-white/80">Begin a new roleplay simulation session</p>
          </Link>

          <Link
            href="/training-library"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Training Library</h3>
            <p className="text-gray-600">Browse objection handling guides</p>
          </Link>

          <Link
            href="/profile"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">View Progress</h3>
            <p className="text-gray-600">See detailed performance analytics</p>
          </Link>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sessions</h2>
          
          {loadingStats ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4D7A]"></div>
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No training sessions yet</p>
              <Link
                href="/?start=true"
                className="inline-block px-6 py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors"
              >
                Start Your First Session
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Drug</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Persona</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{session.drug}</td>
                      <td className="py-3 px-4 text-gray-600">{session.persona}</td>
                      <td className={`py-3 px-4 font-semibold ${getScoreColor(session.score)}`}>
                        {session.score}%
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDuration(session.duration)}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(session.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
