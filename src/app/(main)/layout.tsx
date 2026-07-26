import Navigation from "@/components/Navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-100">
      <Navigation />
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
