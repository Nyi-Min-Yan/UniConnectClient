"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-base-content mb-2">404</h1>
        <p className="text-xl text-base-content/70 mb-2">Page not found</p>
        <p className="text-base-content/50 mb-6">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary w-full sm:w-auto">
            Go home
          </Link>
          <Link href="/login" className="btn btn-ghost w-full sm:w-auto">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}