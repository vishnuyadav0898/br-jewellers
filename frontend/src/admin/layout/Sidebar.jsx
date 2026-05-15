import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { routes } from "../../config/routes";
import { BrandLogo } from "../../shared/components/BrandLogo";
import { useLocale } from "../../shared/localization";
import { useAppStore } from "../../shared/store/useAppStore";
import { cn } from "../../shared/utils/cn";
import { adminNavigation, getSectionForPath } from "../config/navigation";

const isChildActive = (pathname, target) =>
  pathname === target ||
  pathname.startsWith(`${target}/`) ||
  (target.includes(":") && pathname.startsWith(target.split(":")[0]));

export function Sidebar() {
  const location = useLocation();
  const { t } = useLocale();
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const [expandedSection, setExpandedSection] = useState(() => getSectionForPath(location.pathname));

  useEffect(() => {
    setExpandedSection(getSectionForPath(location.pathname));
  }, [location.pathname]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-[300px] flex-col overflow-hidden border-r border-[#ddc8a3] bg-[#fff7ea] px-5 py-6 shadow-[0_18px_55px_rgba(40,24,13,0.08)] transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <BrandLogo to={routes.adminDashboard} className="min-w-0" />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e3c2] text-[#20140f] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const sectionActive = item.to
            ? isChildActive(location.pathname, item.to)
            : item.children?.some((child) => isChildActive(location.pathname, child.to));

          if (!item.children?.length) {
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-[#f2e4c7] hover:text-[#1a120e]",
                    isActive &&
                      "bg-[linear-gradient(135deg,#e9c97b_0%,#f6e4b8_100%)] text-[#1a120e] shadow-[0_12px_30px_rgba(142,103,34,0.18)]"
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          }

          const isExpanded = expandedSection === item.key;

          return (
            <div key={item.key} className="rounded-[24px] border border-[#ecdcbf] bg-white/70 p-1.5">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left text-sm font-semibold transition",
                  sectionActive
                    ? "bg-[linear-gradient(135deg,#e9c97b_0%,#f6e4b8_100%)] text-[#1a120e]"
                    : "text-[#241913] hover:bg-[#f5ead4]"
                )}
                onClick={() => setExpandedSection((current) => (current === item.key ? null : item.key))}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{t(item.labelKey)}</span>
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")}
                />
              </button>

              {isExpanded ? (
                <div className="mt-1 space-y-1 px-1 pb-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-[16px] px-4 py-2.5 text-sm text-stone-600 transition hover:bg-[#f6ecd7] hover:text-[#1a120e]",
                          isActive &&
                            "bg-[#f2dfb4] font-semibold text-[#1a120e] shadow-[inset_0_0_0_1px_rgba(145,101,31,0.14)]"
                        )
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      {t(child.labelKey)}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

    </aside>
  );
}
