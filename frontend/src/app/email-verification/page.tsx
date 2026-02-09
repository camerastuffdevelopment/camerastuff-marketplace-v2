'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmailVerificationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (session === null) {
      router.push('/auth/login');
    }
  }, [session, router]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // TODO: Implement resend email endpoint on backend
      // For now, just show a message
      alert('Verification email resent to ' + session?.user?.email);
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 mx-auto"
        >
          ← Back to Home
        </button>
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification link to <span className="font-semibold">{session?.user?.email}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700">
            Check your email and click the verification link to activate your account. You can start browsing while you wait.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/listings"
            className="block w-full bg-primary-600 text-white font-semibold py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Listings
          </Link>

          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            {isResending ? 'Resending...' : 'Resend Verification Email'}
          </button>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out and try again with a different email
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Problems? <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">Contact support</Link></p>
        </div>
      </div>
    </div>
  );
}
