"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Error Boundary]", error);
  }, [error]);

  const getErrorMessage = (err: Error) => {
    if (err.message.includes("401") || err.message.includes("Unauthorized")) {
      return "Your session has expired. Please sign in again.";
    }
    if (err.message.includes("403") || err.message.includes("Forbidden")) {
      return "You do not have permission to access this resource.";
    }
    if (err.message.includes("404") || err.message.includes("Not Found")) {
      return "The requested page could not be found.";
    }
    if (err.message.includes("500") || err.message.includes("Internal Server Error")) {
      return "Something went wrong on our end. Please try again later.";
    }
    if (err.message.includes("Network") || err.message.includes("fetch")) {
      return "Unable to connect to the server. Please check your connection.";
    }
    return "An unexpected error occurred. Please try again.";
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-base-content mb-2">Something went wrong</h1>
        <p className="text-base-content/70 mb-6">{getErrorMessage(error)}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn btn-primary w-full sm:w-auto"
          >
            Try again
          </button>
          <Link href="/" className="btn btn-ghost w-full sm:w-auto">
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-base-content/40 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}