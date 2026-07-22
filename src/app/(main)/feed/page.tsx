"use client";

import { useState, useEffect } from "react";

type Post = {
  id: number;
  user: { name: string; avatar: string; role: string };
  content: string;
  likes: number;
  comments: number;
  time: string;
};

const MOCK_POSTS: Post[] = [
  { id: 1, user: { name: "Sarah Chen", avatar: "SC", role: "Computer Science" }, content: "Just finished my final year project! 3 months of hard work finally paid off. Anyone else presenting this week?", likes: 42, comments: 12, time: "2m ago" },
  { id: 2, user: { name: "Marcus Johnson", avatar: "MJ", role: "Business Admin" }, content: "Career fair next Thursday! Make sure to bring updated resumes and dress professionally. I heard Google and Microsoft will be there!", likes: 28, comments: 8, time: "15m ago" },
  { id: 3, user: { name: "Emily Rodriguez", avatar: "ER", role: "Psychology" }, content: "Study group for tomorrow's exam in the library 3rd floor at 2pm. Bring your notes and questions! Let's crush this together", likes: 35, comments: 15, time: "1h ago" },
  { id: 4, user: { name: "David Kim", avatar: "DK", role: "Engineering" }, content: "The robotics club showcase was incredible today! Our autonomous drone project successfully completed its first outdoor flight test. So proud of the team!", likes: 56, comments: 20, time: "2h ago" },
  { id: 5, user: { name: "Lisa Thompson", avatar: "LT", role: "Design" }, content: "New design workshop starting next week! Learn UI/UX fundamentals with Figma. Limited spots available!", likes: 31, comments: 7, time: "3h ago" },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handlePost = () => {
    if (!postText.trim()) return;
    const newPost: Post = {
      id: Date.now(),
      user: { name: "User", avatar: "U", role: "Student" },
      content: postText,
      likes: 0,
      comments: 0,
      time: "Just now",
    };
    setPosts([newPost, ...posts]);
    setPostText("");
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">News Feed</h1>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white shadow-sm">
            Latest
          </button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200 transition-colors">
            Trending
          </button>
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            U
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind?"
              rows={2}
              className="w-full resize-none px-0 py-1 text-sm bg-transparent text-base-content outline-none placeholder:text-base-content/30 border-none"
            />
            <div className="flex items-center justify-between pt-2 border-t border-base-200">
              <div className="flex gap-2">
                {["Photo", "Video", "Event"].map((label) => (
                  <button key={label} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-base-200 text-base-content/60 hover:bg-base-200/80 transition-colors">
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={handlePost}
                disabled={!postText.trim()}
                className="px-5 py-1.5 text-sm font-semibold rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-all shadow-sm"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-base-100 rounded-2xl border border-base-200 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton-loader" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 skeleton-loader" />
                  <div className="h-2.5 w-16 skeleton-loader" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full skeleton-loader" />
                <div className="h-3 w-3/4 skeleton-loader" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-base-200 to-primary flex items-center justify-center text-white font-semibold text-sm">
            {post.user.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-base-content">{post.user.name}</p>
            <p className="text-xs text-base-content/40">{post.user.role} &middot; {post.time}</p>
          </div>
        </div>
        <button className="text-base-content/30 hover:text-base-content/60 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-base-content/80 leading-relaxed mb-3">{post.content}</p>

      <div className="flex items-center justify-between pt-3 border-t border-base-200">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${
              liked ? "text-primary" : "text-base-content/40 hover:text-primary"
            }`}
          >
            <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={liked ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm font-medium text-base-content/40 hover:text-accent transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm font-medium text-base-content/40 hover:text-accent transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
