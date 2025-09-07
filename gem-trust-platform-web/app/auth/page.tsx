/**
 * Authentication Page
 * 
 * Main authentication page that acts as a router to display
 * either the sign-in or sign-up form based on user selection.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';

type AuthMode = 'signin' | 'signup' | 'forgot-password';

const AuthPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!isLoading && user.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [user.isAuthenticated, isLoading, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gem Trust Platform
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Secure Authentication
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        {/* Auth Mode Selector */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex">
              <button
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-3 px-4 text-sm font-medium text-center rounded-l-lg border-r border-gray-200 ${
                  authMode === 'signin'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-3 px-4 text-sm font-medium text-center rounded-r-lg ${
                  authMode === 'signup'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="max-w-4xl mx-auto">
          {authMode === 'signin' && (
            <SignInForm
              onSwitchToSignUp={() => setAuthMode('signup')}
              onForgotPassword={() => setAuthMode('forgot-password')}
            />
          )}
          
          {authMode === 'signup' && (
            <SignUpForm
              onSwitchToSignIn={() => setAuthMode('signin')}
            />
          )}
          
          {authMode === 'forgot-password' && (
            <ForgotPasswordForm
              onBackToSignIn={() => setAuthMode('signin')}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2024 Gem Trust Platform. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Terms of Service
              </a>
              <a href="/help" className="text-sm text-gray-500 hover:text-gray-700">
                Help & Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Forgot Password Form Component
const ForgotPasswordForm: React.FC<{ onBackToSignIn: () => void }> = ({ onBackToSignIn }) => {
  const { forgotPassword, resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required');
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      setSuccess('Verification code sent to your email');
      setStep('code');
    } else {
      setError(result.error || 'Failed to send verification code');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code || !newPassword) {
      setError('Code and new password are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const result = await resetPassword(email, code, newPassword);
    if (result.success) {
      setSuccess('Password reset successfully. You can now sign in.');
      setTimeout(() => {
        onBackToSignIn();
      }, 2000);
    } else {
      setError(result.error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' 
              ? 'Enter your email address and we\'ll send you a verification code'
              : 'Enter the verification code and your new password'
            }
          </p>
        </div>

        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onBackToSignIn}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
