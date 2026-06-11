import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, ArrowRight, ShieldCheck } from "lucide-react";
import { routes } from "../../config/routes";
import { notify } from "../../shared/utils/notify";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    notify.success("Thank you for subscribing to our newsletter!", {
      title: "Subscription Confirmed",
      iconKey: "sparkles",
    });
    setEmail("");
  };

  return (
    <footer className="mt-auto border-t border-[#dfccab]/20 bg-[#130d0a] text-[#f4edd9] shadow-[0_-12px_40px_rgba(26,18,14,0.15)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9e6c24] to-[#f4d994] font-display text-2xl font-bold text-[#130d0a] shadow-lg shadow-[#9e6c24]/20">
                BR
              </span>
              <div>
                <span className="font-display text-2xl font-semibold tracking-wider text-[#fffaf2]">
                  BR Jewellers
                </span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d5a957]">Modern Heirlooms</p>
              </div>
            </Link>
            <p className="text-sm leading-6 text-[#eadcc0]/70">
              Crafting premium luxury jewellery with custom-cut gemstones, solid gold, and high-fidelity mock-first architecture.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition hover:bg-[#9e6c24] hover:text-[#130d0a]"
              >
                <Instagram className="h-5 w-5 transition group-hover:scale-110" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition hover:bg-[#9e6c24] hover:text-[#130d0a]"
              >
                <Facebook className="h-5 w-5 transition group-hover:scale-110" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition hover:bg-[#9e6c24] hover:text-[#130d0a]"
              >
                <Twitter className="h-5 w-5 transition group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold tracking-wide text-[#fffaf2]">Collections</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to={routes.appProducts} className="text-[#eadcc0]/70 transition hover:text-[#f4d994]">
                  Browse All Jewellery
                </Link>
              </li>
              <li>
                <Link to={routes.appProducts} className="text-[#eadcc0]/70 transition hover:text-[#f4d994]">
                  Fine Rings
                </Link>
              </li>
              <li>
                <Link to={routes.appProducts} className="text-[#eadcc0]/70 transition hover:text-[#f4d994]">
                  Gold Necklaces
                </Link>
              </li>
              <li>
                <Link to={routes.appProducts} className="text-[#eadcc0]/70 transition hover:text-[#f4d994]">
                  Gemstone Earrings
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold tracking-wide text-[#fffaf2]">Customer Care</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-[#eadcc0]/70 transition hover:text-[#f4d994]">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#eadcc0]/70 transition hover:text-[#f4d994]">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-[#eadcc0]/70 transition hover:text-[#f4d994]">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-[#eadcc0]/70 transition hover:text-[#f4d994]">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold tracking-wide text-[#fffaf2]">Newsletter</h3>
            <p className="text-sm leading-6 text-[#eadcc0]/70">
              Subscribe to receive updates on new curated drops, exclusive member rates, and design system upgrades.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#fffaf2] placeholder-[#eadcc0]/40 outline-none transition focus:border-[#9e6c24]"
              />
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9e6c24] to-[#f4d994] text-[#130d0a] shadow-lg shadow-[#9e6c24]/10 transition hover:scale-105"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-[#eadcc0]/50">
            &copy; {new Date().getFullYear()} BR Jewellers. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#eadcc0]/50">
            <span>Security by</span>
            <span className="flex items-center gap-1 font-semibold text-[#f4d994]">
              <ShieldCheck className="h-4 w-4" /> Secure SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
