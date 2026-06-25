import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppStore } from "../../shared/store/useAppStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageSkeleton } from "../../shared/components/Skeleton";
import { requestNotificationPermission, setupForegroundNotifications } from "../../shared/services/firebase";

function AdminLayoutLoader() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <PageSkeleton />
    </div>
  );
}

export function AdminLayout() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  useEffect(() => {
    requestNotificationPermission();
    const unsubscribe = setupForegroundNotifications();
    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(211,163,71,0.16),transparent_24%),linear-gradient(180deg,#fff9ef_0%,#f4ead7_100%)] text-[#1a120e]">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-[#130f0c]/45 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <Sidebar />

      <div className="h-screen lg:pl-[300px]">
        <div className="flex h-full flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <Suspense fallback={<AdminLayoutLoader />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
