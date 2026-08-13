import Navigation from "@/components/layout/Navigation";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-100">
      <Navigation role="manage" />
      <main className="lg:ml-64 pt-14 lg:pt-16 pb-20 min-h-screen">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
