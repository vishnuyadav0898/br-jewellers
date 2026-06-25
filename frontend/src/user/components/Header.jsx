import { Heart, LayoutDashboard, Lock, LogOut, Package, RotateCcw, ShoppingBag, User, ChevronDown, Menu, X, Home, Gem, BookOpen, Info, Phone } from "lucide-react";
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

const getNavLinkIcon = (labelKey) => {
  switch (labelKey) {
    case "nav.home":
      return <Home className="h-4 w-4" />;
    case "nav.products":
      return <Gem className="h-4 w-4" />;
    case "nav.blogs":
      return <BookOpen className="h-4 w-4" />;
    case "nav.about":
      return <Info className="h-4 w-4" />;
    case "nav.contact":
      return <Phone className="h-4 w-4" />;
    default:
      return null;
  }
};

export function Header() {
  const { t } = useLocale();
  const { user, isAuthenticated, logout, openAuthModal } = useSession();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accountRef = useRef(null);
  const isAdmin = user?.role === "admin";
  const isCustomer = !isAdmin;
  const visibleNavigation = userNavigation;
  const isTabActive = (item) => {
    if (item.to === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(item.to);
  };

  useEffect(() => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 lg:flex">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={() =>
                cn("text-sm font-semibold transition hover:text-[#1a120e]", isTabActive(item) ? "text-[#8a5d18]" : "text-stone-700")
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

        {/* Header Controls (Desktop and Mobile) */}
        <div className="flex items-center gap-2">
          {/* Desktop Preference Controls */}
          <div className="hidden lg:block">
            <PreferenceControls />
          </div>

          {/* Favorites (Desktop only) */}
          <div className="hidden lg:block">
            {isAuthenticated ? (
              <Link to={routes.appFavorites} className={iconLinkClassName} aria-label={t("common.favorites")}>
                <Heart className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                className={iconLinkClassName}
                aria-label={t("common.favorites")}
                onClick={() => openAuthModal("login", routes.appFavorites)}
              >
                <Heart className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Cart (Desktop and Mobile for Customer) */}
          {isCustomer && (
            isAuthenticated ? (
              <Link to={routes.appCart} className={iconLinkClassName} aria-label={t("nav.cart")}>
                <ShoppingBag className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                className={iconLinkClassName}
                aria-label={t("nav.cart")}
                onClick={() => openAuthModal("login", routes.appCart)}
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
            )
          )}

          {/* Admin Dashboard Quick Link (Desktop only) */}
          {!isCustomer && (
            <Link to={routes.adminDashboard} className={cn(iconLinkClassName, "hidden lg:inline-flex")} aria-label={t("header.adminPanel")}>
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          )}

          {/* Notification Center (Desktop and Mobile) */}
          {isAuthenticated ? <NotificationCenter theme="user" /> : null}

          {/* Account Popover / Login Buttons */}
          {isAuthenticated ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#ddc8a3] bg-white p-1 pr-3 sm:px-4 sm:py-2 text-sm font-semibold text-[#1a120e] transition hover:bg-[#fff6e7]"
                onClick={() => setAccountOpen((current) => !current)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1a120e] text-[10px] sm:text-xs text-[#f8ebca] font-bold">
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
                    {isAdmin ? (
                      <>
                        <Link to={routes.adminDashboard} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]">
                          <LayoutDashboard className="h-4 w-4" />
                          {t("header.adminPanel")}
                        </Link>
                        <Link to={routes.adminProfile} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]">
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
                        <Link to={routes.appChangePassword} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f8ecd4]">
                          <Lock className="h-4 w-4" />
                          {t("common.changePassword")}
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
              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <Button tone="secondary" size="sm" onClick={() => openAuthModal("login")}>
                  {t("common.login")}
                </Button>
                <Button size="sm" onClick={() => openAuthModal("register")}>
                  {t("common.register")}
                </Button>
              </div>
              {/* Mobile Auth Icon Button */}
              <button
                type="button"
                className={cn(iconLinkClassName, "sm:hidden")}
                aria-label={t("common.login")}
                onClick={() => openAuthModal("login")}
              >
                <User className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Hamburger Menu Toggle (Mobile only) */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddc8a3] bg-white text-[#1a120e] hover:bg-[#fff3dd] lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="absolute left-0 right-0 top-full border-b border-[#e4d4b2]/70 bg-[#fffcf6]/95 backdrop-blur-xl px-5 py-6 shadow-[0_24px_50px_rgba(26,17,11,0.12)] lg:hidden space-y-6 animate-slideDown z-50 max-h-[85vh] overflow-y-auto">
          {/* Main Navigation Links */}
          <div className="space-y-1.5">
             {visibleNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={() =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-semibold transition-all duration-300 border border-transparent",
                    isTabActive(item)
                      ? "bg-gradient-to-r from-[#f7e6c4]/45 to-transparent text-[#8a5d18] border-l-4 border-l-[#d3a347] pl-3"
                      : "text-stone-700 hover:bg-[#fdf8ee] hover:text-[#1a120e]"
                  )
                }
              >
                <span className="text-[#a58145]">{getNavLinkIcon(item.labelKey)}</span>
                <span>{t(item.labelKey)}</span>
              </NavLink>
            ))}
            {user?.role === "admin" ? (
              <Link
                to={routes.adminDashboard}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-semibold text-[#8a5d18] bg-gradient-to-r from-[#fcf5eb] to-transparent hover:from-[#fcf5eb]/80"
              >
                <span className="text-[#8a5d18]"><LayoutDashboard className="h-4 w-4" /></span>
                <span>{t("common.admin")}</span>
              </Link>
            ) : null}
          </div>

          {/* User Account / Auth Actions */}
          <div className="pt-2">
            {isAuthenticated ? (
              <div className="rounded-3xl border border-[#e4d4b2]/40 bg-[#fffaf1]/80 p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9e6c24] to-[#f4d994] font-display text-base font-bold text-[#130d0a]">
                    {user?.name?.slice(0, 1)?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1a120e]">{user?.name}</h4>
                    <p className="text-xs text-stone-500 truncate max-w-[200px]">{user?.email}</p>
                  </div>
                </div>
                
                <hr className="border-[#e4d4b2]/45" />

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={routes.appProfile}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#e4d4b2]/60 bg-white py-2.5 text-xs font-semibold text-stone-700 hover:bg-[#fff9ef] transition"
                  >
                    <User className="h-3.5 w-3.5" />
                    Profile
                  </Link>
                  <Link
                    to={routes.appOrders}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#e4d4b2]/60 bg-white py-2.5 text-xs font-semibold text-stone-700 hover:bg-[#fff9ef] transition"
                  >
                    <Package className="h-3.5 w-3.5" />
                    Orders
                  </Link>
                </div>
                
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100 py-2.5 text-xs font-semibold text-rose-700 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("common.logout")}
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-[#e4d4b2]/45 bg-[#fffaf1]/80 p-4 space-y-3.5 text-center shadow-sm">
                <p className="text-xs text-stone-600 font-medium">Join BR Jewellers for access to personalized collections, orders, and more.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => openAuthModal("login")}
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-xs font-semibold text-[#20140f] ring-1 ring-[#dbc8a2] transition hover:bg-[#fff7e6]"
                  >
                    {t("common.login")}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal("register")}
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#d3a347] px-4 text-xs font-semibold text-[#120d0b] transition hover:bg-[#e2ba63]"
                  >
                    {t("common.register")}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#e4d4b2]/40 flex flex-col gap-3">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#9e6c24] font-bold text-center">Preferences</span>
            <div className="flex justify-center bg-white/40 backdrop-blur-sm p-3 rounded-2xl border border-[#e4d4b2]/20 w-fit mx-auto shadow-sm">
              <PreferenceControls />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
