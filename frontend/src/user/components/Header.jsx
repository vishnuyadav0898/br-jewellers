import { Heart, LayoutDashboard, LogOut, Package, RotateCcw, ShoppingBag, User, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { routes, userNavigation } from "../../config/routes";
import { BrandLogo } from "../../shared/components/BrandLogo";
import { Button } from "../../shared/components/Button";
import { NotificationCenter } from "../../shared/components/NotificationCenter";
import { PreferenceControls } from "../../shared/components/PreferenceControls";
import { useSession } from "../../shared/hooks/useSession";
import { useLocale } from "../../shared/localization";
import { cn } from "../../shared/utils/cn";

export function Header() {
  const { t } = useLocale();
  const { user, isAuthenticated, logout, openAuthModal } = useSession();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const isAdmin = user?.role === "admin";
  const isCustomer = !isAdmin;
  const visibleNavigation = userNavigation;

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

  const iconLinkClassName =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddc8a3] bg-white text-[#1a120e] transition hover:bg-[#fff3dd]";

  return (
    <header className="sticky top-0 z-40 border-b border-[#e4d4b2] bg-[#fff9ef]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-5 lg:flex">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn("text-sm font-semibold text-stone-600 transition hover:text-[#1a120e]", isActive && "text-[#1a120e]")
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
          {user?.role === "admin" ? (
            <Link to={routes.adminDashboard} className="text-sm font-semibold text-[#8a5d18]">
              {t("common.admin")}
            </Link>
          ) : null}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <PreferenceControls />

          {isCustomer ? (
            <>
              {isAuthenticated ? (
                <>
                  <Link to={routes.appFavorites} className={iconLinkClassName} aria-label={t("common.favorites")}>
                    <Heart className="h-4 w-4" />
                  </Link>
                  <Link to={routes.appCart} className={iconLinkClassName} aria-label={t("nav.cart")}>
                    <ShoppingBag className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={iconLinkClassName}
                    aria-label={t("common.favorites")}
                    onClick={() => openAuthModal("login", routes.appFavorites)}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={iconLinkClassName}
                    aria-label={t("nav.cart")}
                    onClick={() => openAuthModal("login", routes.appCart)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </>
              )}
            </>
          ) : (
            <Link to={routes.adminDashboard} className={iconLinkClassName} aria-label={t("header.adminPanel")}>
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          )}

          {isAuthenticated ? <NotificationCenter theme="user" /> : null}

          {isAuthenticated ? (
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
                <div className="absolute right-0 top-[calc(100%+12px)] w-72 rounded-[28px] border border-[#e0cfad] bg-white p-3 shadow-[0_24px_60px_rgba(31,20,12,0.14)]">
                  <div className="rounded-[22px] bg-[#fff7ea] px-4 py-3">
                    <div className="text-sm font-semibold text-[#1a120e]">{user?.name}</div>
                    <div className="mt-1 text-xs text-stone-500">{user?.email}</div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {isAdmin ? (
                      <>
                        <Link to={routes.adminDashboard} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]">
                          <LayoutDashboard className="h-4 w-4" />
                          {t("header.adminPanel")}
                        </Link>
                        <Link to={routes.adminSettings} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]">
                          <User className="h-4 w-4" />
                          {t("header.accountSettings")}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to={routes.appProfile} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]">
                          <User className="h-4 w-4" />
                          {t("common.profile")}
                        </Link>
                        <Link to={routes.appOrders} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]">
                          <Package className="h-4 w-4" />
                          {t("nav.orders")}
                        </Link>
                        <Link to={routes.appReturns} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]">
                          <RotateCcw className="h-4 w-4" />
                          {t("nav.returns")}
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm text-stone-700 transition hover:bg-[#fff0ec] hover:text-rose-700"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("common.logout")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Button tone="secondary" size="sm" onClick={() => openAuthModal("login")}>
                {t("common.login")}
              </Button>
              <Button size="sm" onClick={() => openAuthModal("register")}>
                {t("common.register")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
