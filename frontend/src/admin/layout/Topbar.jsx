import { useEffect, useRef, useState } from "react";
import { ChevronDown, Lock, LogOut, Menu, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { routes } from "../../config/routes";
import { Button } from "../../shared/components/Button";
import { NotificationCenter } from "../../shared/components/NotificationCenter";
import { PreferenceControls } from "../../shared/components/PreferenceControls";
import { useSession } from "../../shared/hooks/useSession";
import { useLocale } from "../../shared/localization";
import { useAppStore } from "../../shared/store/useAppStore";
import { cn } from "../../shared/utils/cn";
import { getAdminPageMeta } from "../config/navigation";

export function Topbar() {
  const location = useLocation();
  const { t } = useLocale();
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const { logout, user } = useSession();
  const meta = getAdminPageMeta(location.pathname);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <header className="border-b border-[#ddc8a3] bg-white/70 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            tone="secondary"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9e6c24]">
              {t(meta.sectionKey)}
            </div>
            <h1 className="mt-1 font-display text-4xl leading-none text-[#1a120e]">
              {t(meta.pageKey)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter theme="admin" />
          
          <div className="relative" ref={accountRef}>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#ddc8a3] bg-white px-4 py-2 text-sm font-semibold text-[#1a120e] transition hover:bg-[#fff6e7]"
              onClick={() => setAccountOpen((current) => !current)}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1a120e] text-xs text-[#f8ebca]">
                {user?.name?.slice(0, 1)?.toUpperCase()}
              </span>
              <span className="hidden sm:inline">{user?.name?.split(" ")[0]}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", accountOpen && "rotate-180")} />
            </button>

            {accountOpen ? (
              <div className="absolute right-0 top-[calc(100%+12px)] w-72 rounded-[28px] border border-[#e0cfad] bg-white p-3 shadow-[0_24px_60px_rgba(31,20,12,0.14)] z-50">
                <div className="rounded-[22px] bg-[#fff7ea] px-4 py-3">
                  <div className="text-sm font-semibold text-[#1a120e]">{user?.name}</div>
                  <div className="mt-1 text-xs text-stone-500">{user?.email}</div>
                </div>

                <div className="mt-3 space-y-1">
                  <Link
                    to={routes.adminProfile}
                    className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]"
                    onClick={() => setAccountOpen(false)}
                  >
                    <User className="h-4 w-4 text-[#8a5d18]" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to={routes.adminChangePassword}
                    className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]"
                    onClick={() => setAccountOpen(false)}
                  >
                    <Lock className="h-4 w-4 text-[#8a5d18]" />
                    <span>Update Password</span>
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm text-stone-700 transition hover:bg-[#fff0ec] hover:text-rose-700"
                    onClick={() => {
                      setAccountOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
