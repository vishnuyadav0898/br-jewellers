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
  contentPages: [
    {
      id: "page-about",
      page: "about",
      title: "About BR Jewellers",
      body: "<p>BR Jewellers blends everyday polish with ceremonial glamour through handcrafted collections inspired by modern Indian dressing.</p><p>Each assortment is designed to feel gift-ready, wearable, and elevated across celebrations, workdays, and evening occasions.</p>",
      founderName: "Ramesh Yadav",
      founderTitle: "ABOUT THE FOUNDER",
      founderDescription: "Ramesh Yadav founded B.R. Jewellers in 2009 with a small workshop in Jaipur. His dedication to heritage design and local craftsmanship has driven the brand from a tiny local studio to an internationally respected exporter.",
      founderImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      founderOmImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop",
      storyTitle: "OUR STORY",
      storyDescription: "B.R. Jewellers crafts 925 Sterling Silver & Fine Gold Jewelry matching specific client requirements globally. Our design studio combines traditional Rajasthani styles with modern silhouettes, ensuring every single piece has an heirloom presence suitable for ceremonies, soirees, and daily wear.",
      whatWeDoEyebrow: "Introducing The Company",
      whatWeDoTitle: "WHAT WE DO",
      whatWeDoDescription: "Our team of 40+ members creates 8,500+ pieces monthly. Emphasizing design visualization via 3D prototyping, clean casting/wax injection, and top-tier plating baths to ensure each piece meets international quality standards.",
      whatWeDoImage: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?q=80&w=800&auto=format&fit=crop",
      values: [
        {
          id: "val-1",
          title: "Our Values",
          description: "Guiding organizational principles built on honesty, respect, and mutual growth.",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop"
        },
        {
          id: "val-2",
          title: "Commitment",
          description: "Commitment to responsible, ethical manufacturing and sustainable jewelry crafting.",
          image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop"
        },
        {
          id: "val-3",
          title: "Integrity",
          description: "Doing business with trustworthiness, high integrity, and absolute pricing transparency.",
          image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop"
        },
        {
          id: "val-4",
          title: "Quality",
          description: "Commitment to superior quality matching international standards in every finish.",
          image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=400&auto=format&fit=crop"
        },
        {
          id: "val-5",
          title: "Adaptability",
          description: "Staying updated with modern trends, materials, and advanced machinery.",
          image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop"
        }
      ],
      timeline: [
        { id: "t-1", year: "2009", description: "B.R. Jewellers was officially registered as a Jaipur manufacturer." },
        { id: "t-2", year: "2010", description: "Set up our first workshop in Jaipur with 12 local artisans." },
        { id: "t-3", year: "2011", description: "Began international operations, shipping custom pieces to overseas clients." },
        { id: "t-4", year: "2012", description: "Acquired critical export licensing to expand our bulk supply chain globally." },
        { id: "t-5", year: "2013-2014", description: "Became an active member of the Gem & Jewelry Export Promotion Council (GJEPC)." },
        { id: "t-6", year: "2016", description: "Scaled production capacity as the dedicated internal team grew to 50+ members." },
        { id: "t-7", year: "2019", description: "Forged strategic partnerships with top bridal designers in London and New York." },
        { id: "t-8", year: "2020", description: "Maintained employee salaries and supported families throughout pandemic lock-downs." },
        { id: "t-9", year: "2023", description: "Installed a 50kW solar panel roof on our main facility to achieve eco-friendly status." }
      ]
    },
    {
      id: "page-contact",
      page: "contact",
      title: "Get in touch",
      body: "<p>We would love to hear from you. Whether you have a question about our collections, customized orders, shipping, or anything else, our team is ready to answer all your questions.</p><p>You can also reach us directly via email at support@brjewellers.com or visit our design studio in Jaipur, Rajasthan.</p>",
      updatedAt: new Date().toISOString()
    }
  ],
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
