const svgBanner = ({ title, subtitle, accent = "#D79F46", base = "#120F0C" }) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="100%" stop-color="#2F241C" />
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.45" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      <circle cx="360" cy="200" r="260" fill="url(#glow)" />
      <circle cx="1280" cy="700" r="280" fill="url(#glow)" />
      <rect x="92" y="96" width="1416" height="708" rx="42" fill="none" stroke="rgba(245,230,200,0.2)" />
      <text x="120" y="250" fill="#F8F2E8" font-size="92" font-family="Cormorant Garamond, Georgia, serif">${title}</text>
      <text x="120" y="326" fill="#F5E6C8" font-size="34" font-family="Manrope, Arial, sans-serif">${subtitle}</text>
      <text x="120" y="760" fill="#D9B46C" font-size="26" letter-spacing="8" font-family="Manrope, Arial, sans-serif">BR JEWELLERS</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const svgProduct = ({ title, accent = "#D79F46", soft = "#F5E6C8", badge = "BR" }) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100">
      <defs>
        <linearGradient id="panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#140F0C" />
          <stop offset="100%" stop-color="#34261B" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="36%" r="40%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.56" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${soft}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="900" height="1100" rx="46" fill="url(#panel)" />
      <circle cx="450" cy="380" r="230" fill="url(#halo)" />
      <circle cx="450" cy="380" r="152" fill="none" stroke="url(#metal)" stroke-width="28" />
      <circle cx="450" cy="380" r="72" fill="url(#metal)" opacity="0.94" />
      <rect x="130" y="140" width="640" height="480" rx="28" fill="none" stroke="rgba(255,255,255,0.06)" />
      <text x="450" y="780" fill="#F8F2E8" font-size="62" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif">${title}</text>
      <text x="450" y="848" fill="#D6B372" font-size="28" text-anchor="middle" font-family="Manrope, Arial, sans-serif">Handcrafted Fine Jewellery</text>
      <rect x="360" y="902" width="180" height="70" rx="35" fill="rgba(255,255,255,0.05)" stroke="rgba(245,230,200,0.12)" />
      <text x="450" y="947" fill="#F5E6C8" font-size="28" text-anchor="middle" font-family="Manrope, Arial, sans-serif">${badge}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const productImages = (title, accent, soft) => [
  svgProduct({ title, accent, soft, badge: "BR Signature" }),
  svgProduct({ title: `${title} Detail`, accent: soft, soft: accent, badge: "Craft Detail" }),
  svgProduct({ title: `${title} Finish`, accent, soft: "#FFF5E1", badge: "Close View" }),
];

export const initialData = {
  categories: [],
  banners: [],
  users: [],
  products: [],
  reviews: [],
  carts: {},
  favorites: {},
  recentlyViewed: {},
  orders: [],
  blogs: [],
  contentPages: [],
  homeContent: {
    heroBadge: "Curated luxury",
    heroEyebrow: "New Season",
    featuredTitle: "Signature pieces",
    categoriesTitle: "Shop by collection",
    categoriesSubtitle: "Discover our collections",
    recentlyViewedTitle: "Pick up where you left off",
    banners: [],
  },
  coupons: [],
};
