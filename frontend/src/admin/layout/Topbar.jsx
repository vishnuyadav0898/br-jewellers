import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "../../shared/components/Button";
import { NotificationCenter } from "../../shared/components/NotificationCenter";
import { PreferenceControls } from "../../shared/components/PreferenceControls";
import { useSession } from "../../shared/hooks/useSession";
import { useLocale } from "../../shared/localization";
import { useAppStore } from "../../shared/store/useAppStore";
import { getAdminPageMeta } from "../config/navigation";

export function Topbar() {
  const location = useLocation();
  const { t } = useLocale();
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const { logout, user } = useSession();
  const meta = getAdminPageMeta(location.pathname);

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
          <PreferenceControls className="hidden sm:inline-flex" />
          <NotificationCenter theme="admin" />
          <div className="hidden rounded-full border border-[#ddc8a3] bg-white px-4 py-2 text-sm text-stone-600 sm:block">
            {t("admin.topbar.signedInAs")}{" "}
            <span className="font-semibold text-[#1a120e]">{user?.name}</span>
          </div>
          <Button tone="secondary" size="sm" onClick={logout}>
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
