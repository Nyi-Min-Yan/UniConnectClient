"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 150);

    const redirect = setTimeout(() => {
      router.push("/login");
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-72 h-72 rounded-full bg-primary/5 blur-3xl"
            style={{
              top: `${30 + i * 40}px`,
              left: `${-60 + i * 60}px`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}

        <div className="relative flex flex-col items-center animate-fade-in-up">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center animate-float">
              <span className="text-white text-5xl font-bold">U</span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent animate-pulse" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-base-200 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-base-content mb-2 tracking-tight">
            Uni<span className="text-primary">Connect</span>
          </h1>
          <p className="text-base-content/60 text-base sm:text-lg mb-10 font-medium">
            Your Campus Community
          </p>

          <div className="w-48 sm:w-64 h-1.5 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-base-content/40 text-sm mt-3 font-medium">
            {Math.min(Math.round(progress), 100)}% loaded
          </p>

          <div className="flex gap-2 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
