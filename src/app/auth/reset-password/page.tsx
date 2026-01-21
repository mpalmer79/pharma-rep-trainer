'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if user is authenticated (they should be after clicking the reset link)
  useEffect(() => {
    // Give time for auth state to be determined
    const timer = setTimeout(() => {
      if (!authLoading && !isAuthenticated) {
        router.push('/auth/forgot-password');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4D7A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B4D7A] via-[#2D6A9F] to-[#1B4D7A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <span className="text-2xl font-bold text-white">RepIQ</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">Set new password</h2>
          <p className="mt-2 text-white/70">Enter your new password below</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Password updated!</h3>
              <p className="text-gray-600 mb-4">
                Your password has been changed successfully. Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4D7A]/20 focus:border-[#1B4D7A]"
                    placeholder="••••••••"
                  />
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4D7A]/20 focus:border-[#1B4D7A]"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              <p className="mt-6 text-center text-gray-600">
                <Link 
                  href="/auth/login" 
                  className="text-[#1B4D7A] hover:text-[#E67E22] font-medium"
                >
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Back to home */}
        <p className="mt-6 text-center">
          <Link href="/" className="text-white/70 hover:text-white text-sm">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
