import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../../user/components/Header";
import { Footer } from "../../user/components/Footer";
import { AuthModal } from "../components/AuthModal";
import { PageSkeleton } from "../components/Skeleton";

function LayoutLoader() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <PageSkeleton />
    </div>
  );
}

export function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(211,163,71,0.18),transparent_26%),linear-gradient(180deg,#fffaf1_0%,#f7eedf_100%)] text-[#1a120e]">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<LayoutLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
}
