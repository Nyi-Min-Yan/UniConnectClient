"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";

type ExploreCategory = "all" | "clubs" | "events" | "people" | "courses";

type ExploreItem = {
  id: number;
  title: string;
  description: string;
  category: ExploreCategory;
  members?: string;
  date?: string;
  tags: string[];
};

const EXPLORE_ITEMS: ExploreItem[] = [
  { id: 1, title: "Robotics Club", description: "Building the future, one robot at a time. Join us for weekly builds and competitions!", category: "clubs", tags: ["Robotics", "Engineering"], members: "45 members" },
  { id: 2, title: "Photography Workshop", description: "Learn the art of photography from professional photographers.", category: "events", tags: ["Photography", "Workshop"], date: "Jul 25, 2026" },
  { id: 3, title: "Sarah Chen", description: "Computer Science - Year 3 - AI Enthusiast", category: "people", tags: ["CS", "AI"] },
  { id: 4, title: "Web Development 101", description: "Learn modern web development with React and Next.js", category: "courses", tags: ["Web Dev", "React"], members: "128 enrolled" },
  { id: 5, title: "Chess Club", description: "Strategic minds unite! Casual and competitive chess for all skill levels.", category: "clubs", tags: ["Chess", "Strategy"], members: "32 members" },
  { id: 6, title: "Career Fair 2026", description: "Meet top employers and find your dream internship or job.", category: "events", tags: ["Career", "Networking"], date: "Aug 5, 2026" },
  { id: 7, title: "Marcus Johnson", description: "Business Admin - Year 4 - Entrepreneur", category: "people", tags: ["Business", "Startup"] },
  { id: 8, title: "Data Science Fundamentals", description: "Introduction to data analysis, machine learning, and statistics.", category: "courses", tags: ["Data Science", "ML"], members: "95 enrolled" },
  { id: 9, title: "Debate Society", description: "Sharpen your argumentative skills and engage in intellectual discourse.", category: "clubs", tags: ["Debate", "Public Speaking"], members: "28 members" },
  { id: 10, title: "Hackathon Weekend", description: "48 hours of coding, creativity, and collaboration.", category: "events", tags: ["Hackathon", "Coding"], date: "Sep 12, 2026" },
];

export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExploreCategory>("all");
  const [items, setItems] = useState<ExploreItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(EXPLORE_ITEMS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = items.filter((item) => {
    const matchCategory = category === "all" || item.category === category;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">Explore</h1>
        </div>
        <div className="h-10 skeleton-loader rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-base-100 rounded-2xl border border-base-200 p-5 space-y-3">
              <div className="h-4 w-24 skeleton-loader" />
              <div className="h-3 w-full skeleton-loader" />
              <div className="h-3 w-3/4 skeleton-loader" />
              <div className="flex gap-2">
                <div className="h-5 w-16 skeleton-loader rounded-full" />
                <div className="h-5 w-20 skeleton-loader rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Explore</h1>
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clubs, events, people, courses..."
          className="w-full px-4 py-3 pl-11 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/30"
        />
        <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all", "clubs", "events", "people", "courses"] as ExploreCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-all ${
              category === cat
                ? "bg-primary text-white shadow-sm"
                : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm font-medium text-base-content/60">No results found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-base-100 rounded-2xl border border-base-200 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-base-content group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                {item.members && (
                  <span className="text-[10px] text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full">
                    {item.members}
                  </span>
                )}
                {item.date && (
                  <span className="text-[10px] text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full">
                    {item.date}
                  </span>
                )}
              </div>
              <p className="text-xs text-base-content/60 leading-relaxed">{item.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-base-200 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
