"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Global Error Boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>UniConnect - Error</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-base-100">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-2">Application Error</h1>
            <p className="text-base-content/70 mb-6">
              A critical error occurred. Please refresh the page or try again later.
            </p>
            <button
              onClick={reset}
              className="btn btn-primary w-full sm:w-auto"
            >
              Refresh Page
            </button>
            {error.digest && (
              <p className="mt-4 text-xs text-base-content/40 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}