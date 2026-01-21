'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    job_title: '',
    experience_level: 'intermediate',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = profile as any;
      setFormData({
        full_name: p.full_name || '',
        company: p.company || '',
        job_title: p.job_title || '',
        experience_level: p.experience_level || 'intermediate',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updateData = {
        full_name: formData.full_name,
        company: formData.company,
        job_title: formData.job_title,
        experience_level: formData.experience_level,
        updated_at: new Date().toISOString(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSaving(false);
    }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = profile as any;

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
              <span className="text-gray-600">Profile</span>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-[#1B4D7A] transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-[#1B4D7A] hover:bg-[#1B4D7A]/10 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email (read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Full Name */}
            <div className="mb-6">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg ${
                  isEditing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B4D7A]/20 focus:border-[#1B4D7A]'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
                placeholder="John Doe"
              />
            </div>

            {/* Company */}
            <div className="mb-6">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg ${
                  isEditing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B4D7A]/20 focus:border-[#1B4D7A]'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
                placeholder="Acme Pharmaceuticals"
              />
            </div>

            {/* Job Title */}
            <div className="mb-6">
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                id="job_title"
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg ${
                  isEditing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B4D7A]/20 focus:border-[#1B4D7A]'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
                placeholder="Sales Representative"
              />
            </div>

            {/* Experience Level */}
            <div className="mb-6">
              <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                id="experience_level"
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg ${
                  isEditing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B4D7A]/20 focus:border-[#1B4D7A]'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="experienced">Experienced (3-5 years)</option>
                <option value="expert">Expert (5+ years)</option>
              </select>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setFormData({
                        full_name: p?.full_name || '',
                        company: p?.company || '',
                        job_title: p?.job_title || '',
                        experience_level: p?.experience_level || 'intermediate',
                      });
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Account Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Member since</p>
                <p className="text-gray-900">
                  {p?.created_at
                    ? new Date(p.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last updated</p>
                <p className="text-gray-900">
                  {p?.updated_at
                    ? new Date(p.updated_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
