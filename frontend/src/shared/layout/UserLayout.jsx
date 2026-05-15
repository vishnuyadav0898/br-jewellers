import { Outlet } from "react-router-dom";
import { Header } from "../../user/components/Header";
import { AuthModal } from "../components/AuthModal";

export function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(211,163,71,0.18),transparent_26%),linear-gradient(180deg,#fffaf1_0%,#f7eedf_100%)] text-[#1a120e]">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-[#e4d4b2] bg-[#fff7ea]/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm sm:px-6 lg:px-8">
          <p className="font-semibold text-[#1a120e]">BR Jewellers customer panel</p>
          <p className="text-stone-500">
            Browse collections, manage orders, and update your account from one place.
          </p>
        </div>
      </footer>
      <AuthModal />
    </div>
  );
}
