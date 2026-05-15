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
  categories: [
    {
      id: "cat-rings",
      name: "Rings",
      slug: "rings",
      description: "Halo, solitaire, cocktail, and daily wear signatures.",
    },
    {
      id: "cat-necklaces",
      name: "Necklaces",
      slug: "necklaces",
      description: "Statement collars, layered chains, and bridal heirlooms.",
    },
    {
      id: "cat-earrings",
      name: "Earrings",
      slug: "earrings",
      description: "Studs, drops, and chandbalis with modern Indian styling.",
    },
    {
      id: "cat-bracelets",
      name: "Bracelets",
      slug: "bracelets",
      description: "Slim cuffs and diamond-look tennis bracelets.",
    },
  ],
  banners: [
    {
      id: "banner-1",
      title: "Bridal Gold, Reimagined",
      subtitle: "Layer-ready heirloom pieces for ceremonies, soirees, and everything after.",
      cta: "Explore the edit",
      href: "/app/products?category=necklaces",
      image: svgBanner({
        title: "Bridal Gold, Reimagined",
        subtitle: "Layer-ready heirloom pieces for ceremonies, soirees, and everything after.",
        accent: "#D9A64F",
      }),
    },
    {
      id: "banner-2",
      title: "Minimal Luxe for Everyday",
      subtitle: "Rings, studs, and cuffs that work from office polish to evening shimmer.",
      cta: "Shop new arrivals",
      href: "/app/products",
      image: svgBanner({
        title: "Minimal Luxe for Everyday",
        subtitle: "Rings, studs, and cuffs that work from office polish to evening shimmer.",
        accent: "#E3C37F",
        base: "#18120F",
      }),
    },
    {
      id: "banner-3",
      title: "Festive Sets With Modern Lines",
      subtitle: "Rich tones, clean silhouettes, and lightweight craftsmanship.",
      cta: "View festive picks",
      href: "/app/products?color=Rose%20Gold",
      image: svgBanner({
        title: "Festive Sets With Modern Lines",
        subtitle: "Rich tones, clean silhouettes, and lightweight craftsmanship.",
        accent: "#C98362",
        base: "#120D0B",
      }),
    },
  ],
  users: [
    {
      id: "user-1",
      name: "Aarohi Bansal",
      email: "aarohi@brdemo.com",
      password: "demo123",
      role: "customer",
      phone: "+91 98111 22334",
      avatar:
        "https://api.dicebear.com/9.x/initials/svg?seed=Aarohi%20Bansal&backgroundType=gradientLinear",
      addresses: [
        {
          id: "addr-1",
          label: "Home",
          name: "Aarohi Bansal",
          line1: "24, Golf Course Road",
          city: "Gurugram",
          state: "Haryana",
          pincode: "122002",
        },
      ],
    },
    {
      id: "user-2",
      name: "Ritvik Shah",
      email: "ritvik@brdemo.com",
      password: "demo123",
      role: "customer",
      phone: "+91 98100 44556",
      avatar:
        "https://api.dicebear.com/9.x/initials/svg?seed=Ritvik%20Shah&backgroundType=gradientLinear",
      addresses: [],
    },
    {
      id: "admin-1",
      name: "BR Admin",
      email: "admin@brdemo.com",
      password: "demo123",
      role: "admin",
      phone: "+91 98989 45454",
      avatar:
        "https://api.dicebear.com/9.x/initials/svg?seed=BR%20Admin&backgroundType=gradientLinear",
      addresses: [],
    },
  ],
  products: [
    {
      id: "prod-1",
      slug: "celeste-halo-ring",
      name: "Celeste Halo Ring",
      category: "Rings",
      categoryId: "cat-rings",
      price: 46999,
      originalPrice: 52999,
      description:
        "An elevated halo ring with a bright center stone look, slim band, and finely polished shoulders.",
      details:
        "Designed for day-to-night shine with a secure setting, balanced profile, and lightweight wear.",
      colors: [
        { name: "Yellow Gold", code: "#C79B42" },
        { name: "Rose Gold", code: "#C97C65" },
      ],
      sizes: ["5", "6", "7", "8"],
      featured: true,
      badge: "Best Seller",
      stock: 12,
      tags: ["engagement", "signature", "gift"],
      images: productImages("Celeste Halo Ring", "#D79F46", "#F3DEB4"),
    },
    {
      id: "prod-2",
      slug: "imperial-emerald-necklace",
      name: "Imperial Emerald Necklace",
      category: "Necklaces",
      categoryId: "cat-necklaces",
      price: 128000,
      originalPrice: 139500,
      description:
        "A festive collar necklace with emerald-toned highlights, structured layering, and heirloom presence.",
      details:
        "Balances statement scale with comfort using articulated links and a soft-sit back chain.",
      colors: [
        { name: "Antique Gold", code: "#9A6B2F" },
        { name: "Emerald Green", code: "#0E8B63" },
      ],
      sizes: ["16 in", "18 in"],
      featured: true,
      badge: "Bridal Edit",
      stock: 6,
      tags: ["bridal", "festive", "neckline"],
      images: productImages("Imperial Emerald Necklace", "#A77831", "#F4D69A"),
    },
    {
      id: "prod-3",
      slug: "aurora-tennis-bracelet",
      name: "Aurora Tennis Bracelet",
      category: "Bracelets",
      categoryId: "cat-bracelets",
      price: 51999,
      originalPrice: 57999,
      description:
        "A flexible tennis bracelet with high-shine stones, clean articulation, and elegant everyday balance.",
      details:
        "Crafted for stackability with a secure clasp and fluid movement around the wrist.",
      colors: [
        { name: "White Gold", code: "#D8DCE4" },
        { name: "Silver Mist", code: "#BFC4CD" },
      ],
      sizes: ["S", "M", "L"],
      featured: false,
      badge: "Daily Luxe",
      stock: 18,
      tags: ["stacking", "gift", "minimal"],
      images: productImages("Aurora Tennis Bracelet", "#D5C3A2", "#F7EEE0"),
    },
    {
      id: "prod-4",
      slug: "noor-chandbali-earrings",
      name: "Noor Chandbali Earrings",
      category: "Earrings",
      categoryId: "cat-earrings",
      price: 44999,
      originalPrice: 48500,
      description:
        "Classic chandbalis with pearl-inspired accents and a light swing built for long celebrations.",
      details:
        "The curved frame gives this pair a flattering face-lighting effect without heavy pull.",
      colors: [
        { name: "Yellow Gold", code: "#D1A24D" },
        { name: "Pearl White", code: "#F6F0E6" },
      ],
      sizes: ["One Size"],
      featured: true,
      badge: "Festive Favorite",
      stock: 10,
      tags: ["occasion", "wedding guest", "pearls"],
      images: productImages("Noor Chandbali Earrings", "#D79F46", "#F5E1BE"),
    },
    {
      id: "prod-5",
      slug: "velour-solitaire-ring",
      name: "Velour Solitaire Ring",
      category: "Rings",
      categoryId: "cat-rings",
      price: 73999,
      originalPrice: 81250,
      description:
        "A sleek solitaire silhouette with elevated shoulders and a refined taper at the base.",
      details:
        "Polished for crisp light return and styled to feel timeless rather than trend-driven.",
      colors: [{ name: "Rose Gold", code: "#C87B67" }],
      sizes: ["6", "7", "8"],
      featured: false,
      badge: "New",
      stock: 7,
      tags: ["proposal", "gift", "occasion"],
      images: productImages("Velour Solitaire Ring", "#CB7F6E", "#F3D6C9"),
    },
    {
      id: "prod-6",
      slug: "regal-drop-necklace",
      name: "Regal Drop Necklace",
      category: "Necklaces",
      categoryId: "cat-necklaces",
      price: 95999,
      originalPrice: 104999,
      description:
        "A graduated drop necklace featuring ruby-inspired accents and smooth shoulder drape.",
      details:
        "Pairs well with open necklines and festive blouses thanks to its centered silhouette.",
      colors: [
        { name: "Yellow Gold", code: "#CB943D" },
        { name: "Ruby Red", code: "#8E1F33" },
      ],
      sizes: ["18 in"],
      featured: true,
      badge: "Ceremony Ready",
      stock: 5,
      tags: ["bridal", "ruby", "set"],
      images: productImages("Regal Drop Necklace", "#C38B33", "#F8E9C2"),
    },
    {
      id: "prod-7",
      slug: "luna-diamond-studs",
      name: "Luna Diamond Studs",
      category: "Earrings",
      categoryId: "cat-earrings",
      price: 28999,
      originalPrice: 32500,
      description:
        "Round studs with a bright diamond-look center and a low-profile basket for all-day comfort.",
      details:
        "The clean framing makes these an easy gift and a wardrobe essential.",
      colors: [
        { name: "White Gold", code: "#DCE1E8" },
        { name: "Yellow Gold", code: "#D0A04A" },
      ],
      sizes: ["One Size"],
      featured: false,
      badge: "Gift Pick",
      stock: 24,
      tags: ["daily wear", "studs", "gift"],
      images: productImages("Luna Diamond Studs", "#E6E9F0", "#F9F2D3"),
    },
    {
      id: "prod-8",
      slug: "seraphina-cuff",
      name: "Seraphina Cuff",
      category: "Bracelets",
      categoryId: "cat-bracelets",
      price: 36999,
      originalPrice: 40999,
      description:
        "A slim sculpted cuff with soft curves and subtle stone detailing across the top line.",
      details:
        "Looks polished solo and balanced in stacks with watches or bangles.",
      colors: [
        { name: "Rose Gold", code: "#D28B76" },
        { name: "Champagne Gold", code: "#E4C890" },
      ],
      sizes: ["S", "M"],
      featured: false,
      badge: "Editor's Pick",
      stock: 14,
      tags: ["stacking", "modern", "minimal"],
      images: productImages("Seraphina Cuff", "#E1B977", "#F7E6C4"),
    },
    {
      id: "prod-9",
      slug: "mirage-layered-chain",
      name: "Mirage Layered Chain",
      category: "Necklaces",
      categoryId: "cat-necklaces",
      price: 55999,
      originalPrice: 61250,
      description:
        "A ready-layered chain necklace with contrasting textures for effortless modern styling.",
      details:
        "Built to sit neatly without tangling thanks to the anchored back placement.",
      colors: [
        { name: "Champagne Gold", code: "#D8B36B" },
        { name: "Matte Gold", code: "#A77831" },
      ],
      sizes: ["18 in", "20 in"],
      featured: false,
      badge: "New In",
      stock: 9,
      tags: ["layers", "office", "party"],
      images: productImages("Mirage Layered Chain", "#D7AF60", "#F7E7BF"),
    },
    {
      id: "prod-10",
      slug: "opaline-petal-ring",
      name: "Opaline Petal Ring",
      category: "Rings",
      categoryId: "cat-rings",
      price: 32499,
      originalPrice: 35600,
      description:
        "A petal-inspired cluster ring with soft curves and a feminine profile.",
      details:
        "Works beautifully as an event accent or a statement daily ring.",
      colors: [
        { name: "Rose Gold", code: "#CA806A" },
        { name: "Pearl White", code: "#F6F1E8" },
      ],
      sizes: ["5", "6", "7"],
      featured: false,
      badge: "Under 35k",
      stock: 16,
      tags: ["floral", "gift", "statement"],
      images: productImages("Opaline Petal Ring", "#CA806A", "#F6E5DD"),
    },
    {
      id: "prod-11",
      slug: "zaria-jhumka-drops",
      name: "Zaria Jhumka Drops",
      category: "Earrings",
      categoryId: "cat-earrings",
      price: 38999,
      originalPrice: 43499,
      description:
        "Lightweight jhumka drops with crisp detailing and a flattering shoulder-skimming fall.",
      details:
        "Festive in spirit but streamlined enough to pair with contemporary outfits.",
      colors: [
        { name: "Antique Gold", code: "#A87836" },
        { name: "Rose Pink", code: "#D0897A" },
      ],
      sizes: ["One Size"],
      featured: true,
      badge: "Trending",
      stock: 11,
      tags: ["jhumka", "festive", "fusion"],
      images: productImages("Zaria Jhumka Drops", "#C88D4D", "#F4DDB2"),
    },
    {
      id: "prod-12",
      slug: "solaris-diamond-bangle",
      name: "Solaris Diamond Bangle",
      category: "Bracelets",
      categoryId: "cat-bracelets",
      price: 88999,
      originalPrice: 94600,
      description:
        "A structured oval bangle with clean diamond-look framing and a sharp locking clasp.",
      details:
        "Built to hold its form while still feeling refined and lightweight on the wrist.",
      colors: [
        { name: "White Gold", code: "#DFE3EC" },
        { name: "Yellow Gold", code: "#D4A349" },
      ],
      sizes: ["2.4", "2.6", "2.8"],
      featured: true,
      badge: "Signature Piece",
      stock: 8,
      tags: ["bangle", "occasion", "diamond"],
      images: productImages("Solaris Diamond Bangle", "#E1E4ED", "#F6EFD6"),
    },
  ],
  reviews: [
    {
      id: "rev-1",
      productId: "prod-1",
      userId: "user-1",
      username: "Aarohi Bansal",
      rating: 5,
      comment: "Looks premium in person and the finish is much more delicate than the images suggest.",
      createdAt: "2026-04-10T10:15:00.000Z",
    },
    {
      id: "rev-2",
      productId: "prod-2",
      userId: "user-2",
      username: "Ritvik Shah",
      rating: 4,
      comment: "Bought it for a family wedding. The structure feels festive but not too heavy.",
      createdAt: "2026-04-02T06:00:00.000Z",
    },
    {
      id: "rev-3",
      productId: "prod-4",
      userId: "user-1",
      username: "Aarohi Bansal",
      rating: 5,
      comment: "Very easy to wear for hours and still has that proper occasion look.",
      createdAt: "2026-03-28T13:40:00.000Z",
    },
    {
      id: "rev-4",
      productId: "prod-7",
      userId: "user-2",
      username: "Ritvik Shah",
      rating: 5,
      comment: "Gifted these and they were instantly loved. Great size for daily wear.",
      createdAt: "2026-04-18T09:45:00.000Z",
    },
  ],
  carts: {
    "user-1": [
      {
        id: "cart-1",
        productId: "prod-4",
        quantity: 1,
        selectedColor: "Yellow Gold",
        selectedSize: "One Size",
      },
    ],
  },
  favorites: {
    "user-1": ["prod-2", "prod-6", "prod-11"],
    "user-2": ["prod-1", "prod-7"],
  },
  recentlyViewed: {
    "user-1": ["prod-1", "prod-4", "prod-11"],
  },
  orders: [
    {
      id: "ord-1001",
      userId: "user-1",
      orderNumber: "BR-1001",
      createdAt: "2026-04-14T08:30:00.000Z",
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      status: "Delivered",
      subtotal: 128000,
      discount: 5000,
      shipping: 0,
      total: 123000,
      shippingAddress: {
        name: "Aarohi Bansal",
        line1: "24, Golf Course Road",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002",
      },
      items: [
        {
          productId: "prod-2",
          name: "Imperial Emerald Necklace",
          quantity: 1,
          price: 128000,
          image: productImages("Imperial Emerald Necklace", "#A77831", "#F4D69A")[0],
        },
      ],
      timeline: [
        {
          id: "step-1",
          label: "Ordered",
          completed: true,
          timestamp: "2026-04-14T08:30:00.000Z",
          note: "Your order was placed successfully.",
        },
        {
          id: "step-2",
          label: "Shipped",
          completed: true,
          timestamp: "2026-04-15T14:20:00.000Z",
          note: "Packed and handed over to our trusted delivery partner.",
        },
        {
          id: "step-3",
          label: "Delivered",
          completed: true,
          timestamp: "2026-04-17T12:10:00.000Z",
          note: "Delivered at your doorstep.",
        },
      ],
    },
    {
      id: "ord-1002",
      userId: "user-1",
      orderNumber: "BR-1002",
      createdAt: "2026-04-20T10:10:00.000Z",
      paymentMethod: "Card",
      paymentStatus: "Paid",
      status: "Shipped",
      subtotal: 51999,
      discount: 0,
      shipping: 0,
      total: 51999,
      shippingAddress: {
        name: "Aarohi Bansal",
        line1: "24, Golf Course Road",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002",
      },
      items: [
        {
          productId: "prod-3",
          name: "Aurora Tennis Bracelet",
          quantity: 1,
          price: 51999,
          image: productImages("Aurora Tennis Bracelet", "#D5C3A2", "#F7EEE0")[0],
        },
      ],
      timeline: [
        {
          id: "step-1",
          label: "Ordered",
          completed: true,
          timestamp: "2026-04-20T10:10:00.000Z",
          note: "Order confirmed and awaiting dispatch.",
        },
        {
          id: "step-2",
          label: "Shipped",
          completed: true,
          timestamp: "2026-04-21T16:00:00.000Z",
          note: "In transit to your city hub.",
        },
        {
          id: "step-3",
          label: "Delivered",
          completed: false,
          timestamp: null,
          note: "Expected within 2 business days.",
        },
      ],
    },
  ],
  blogs: [
    {
      id: "blog-1",
      slug: "how-to-style-bridal-jewellery-without-overdoing-it",
      title: "How To Style Bridal Jewellery Without Overdoing It",
      excerpt:
        "A balanced bridal stack feels intentional, not overwhelming. Start with neckline, then layer focus pieces around it.",
      coverImage: svgBanner({
        title: "Style Bridal Jewellery",
        subtitle: "Build a layered bridal look with restraint and focus.",
        accent: "#D7A351",
      }),
      author: "Meera Sethi",
      publishedAt: "2026-04-11T06:30:00.000Z",
      readTime: "5 min read",
      content: [
        "The easiest way to keep bridal jewellery elegant is to decide where the eye should land first. If your necklace is intricate, let earrings support it instead of competing with it.",
        "Gold tones look richer when texture changes gradually. Pair polished pieces with one antique-finish element rather than mixing too many high-contrast surfaces.",
        "Comfort matters as much as styling. If a set will be worn through ceremonies, photographs, and a reception, lighter construction can do more for confidence than extra volume.",
      ],
      comments: [
        {
          id: "blog-comment-1",
          username: "Aarohi Bansal",
          comment: "Loved the neckline-first advice. It makes shopping sets much easier.",
          createdAt: "2026-04-12T09:15:00.000Z",
        },
      ],
    },
    {
      id: "blog-2",
      slug: "everyday-jewellery-essentials-for-a-polished-wardrobe",
      title: "Everyday Jewellery Essentials For A Polished Wardrobe",
      excerpt:
        "The best daily jewellery disappears into your routine while quietly improving every outfit.",
      coverImage: svgBanner({
        title: "Everyday Jewellery Essentials",
        subtitle: "The pieces that make morning dressing feel complete.",
        accent: "#E3BE79",
      }),
      author: "Rhea Anand",
      publishedAt: "2026-03-30T07:20:00.000Z",
      readTime: "4 min read",
      content: [
        "A pair of bright studs, one stackable bracelet, and a clean ring cover most wardrobes surprisingly well.",
        "If you wear both warm and cool tones, prioritize balanced finishes like champagne gold or white-gold-inspired settings.",
        "Think in repetition. Wearing the same few polished signatures regularly makes your style feel clearer and more intentional.",
      ],
      comments: [],
    },
    {
      id: "blog-3",
      slug: "choosing-ring-sizes-when-you-are-buying-a-gift",
      title: "Choosing Ring Sizes When You Are Buying A Gift",
      excerpt:
        "Sizing guesswork can feel stressful, but a few practical checks usually narrow it down quickly.",
      coverImage: svgBanner({
        title: "Choosing Ring Sizes",
        subtitle: "A practical guide when the piece is a surprise.",
        accent: "#C98268",
      }),
      author: "Naina Kapoor",
      publishedAt: "2026-02-21T10:00:00.000Z",
      readTime: "6 min read",
      content: [
        "If you can borrow an existing ring, compare its inner diameter with a simple ring-size guide.",
        "When you are between sizes, slightly larger is usually safer for gifting than slightly smaller.",
        "Adjustable or open-front designs are useful if you want flexibility without sacrificing presentation.",
      ],
      comments: [
        {
          id: "blog-comment-2",
          username: "Ritvik Shah",
          comment: "Helpful timing. I was literally trying to guess this for an anniversary gift.",
          createdAt: "2026-03-02T11:00:00.000Z",
        },
      ],
    },
  ],
  contentPages: [
    {
      id: "page-about",
      page: "About",
      title: "About BR Jewellers",
      body:
        "<p>BR Jewellers blends everyday polish with ceremonial glamour through handcrafted collections inspired by modern Indian dressing.</p><p>Each assortment is designed to feel gift-ready, wearable, and elevated across celebrations, workdays, and evening occasions.</p>",
      updatedAt: "2026-04-16T09:00:00.000Z",
    },
    {
      id: "page-contact",
      page: "Contact",
      title: "Contact BR Jewellers",
      body:
        "<p>Invite customers to book consultations, enquire about bridal styling, or request gifting guidance. Share store timings, WhatsApp support, and service response expectations here.</p>",
      updatedAt: "2026-04-16T09:00:00.000Z",
    },
    {
      id: "page-blogs",
      page: "Blogs",
      title: "Journal",
      body:
        "<p>Use the journal to publish styling guidance, gifting advice, and new collection stories that support discovery across the storefront.</p>",
      updatedAt: "2026-04-16T09:00:00.000Z",
    },
  ],
  homeContent: {
    heroBadge: "Curated festive and everyday luxury",
    heroEyebrow: "New Season Edit",
    featuredTitle: "Signature pieces with modern polish",
    categoriesTitle: "Shop by collection",
    categoriesSubtitle: "Discover rings, necklaces, earrings, and bracelets arranged for gifting, bridal moments, and everyday sparkle.",
    recentlyViewedTitle: "Pick up where you left off.",
    banners: [
      {
        id: "banner-1",
        tag: "Bridal Focus",
        title: "Bridal Gold, Reimagined",
        subtitle: "Layer-ready heirloom pieces for ceremonies, soirees, and everything after.",
        cta: "Explore the edit",
        href: "/app/products?category=necklaces",
        image: svgBanner({
          title: "Bridal Gold, Reimagined",
          subtitle: "Layer-ready heirloom pieces for ceremonies, soirees, and everything after.",
          accent: "#D9A64F",
        }),
      },
      {
        id: "banner-2",
        tag: "Daily Luxe",
        title: "Minimal Luxe for Everyday",
        subtitle: "Rings, studs, and cuffs that work from office polish to evening shimmer.",
        cta: "Shop new arrivals",
        href: "/app/products",
        image: svgBanner({
          title: "Minimal Luxe for Everyday",
          subtitle: "Rings, studs, and cuffs that work from office polish to evening shimmer.",
          accent: "#E3C37F",
          base: "#18120F",
        }),
      },
      {
        id: "banner-3",
        tag: "Festive Ready",
        title: "Festive Sets With Modern Lines",
        subtitle: "Rich tones, clean silhouettes, and lightweight craftsmanship.",
        cta: "View festive picks",
        href: "/app/products?color=Rose%20Gold",
        image: svgBanner({
          title: "Festive Sets With Modern Lines",
          subtitle: "Rich tones, clean silhouettes, and lightweight craftsmanship.",
          accent: "#C98362",
          base: "#120D0B",
        }),
      },
    ],
  },
  coupons: [
    { code: "BRIDE10", type: "percent", value: 10, label: "10% off bridal favourites" },
    { code: "LUXE5000", type: "flat", value: 5000, label: "Flat Rs. 5,000 off above Rs. 1,00,000" },
  ],
};
