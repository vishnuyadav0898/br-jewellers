import "dotenv/config";
import mongoose from "mongoose";
import ContentPage from "../models/content_page.model.js";
import { logger } from "../utils/logger.js";

const aboutUsData = {
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
};

const seedContent = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.error("Missing env var: MONGODB_URI");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    logger.info("MongoDB connected for seeding content pages");

    await ContentPage.findOneAndUpdate(
      { page: "about-us" },
      { data: aboutUsData },
      { upsert: true, returnDocument: "after" }
    );
    logger.info("Seeded 'about-us' content page successfully.");

    await mongoose.disconnect();
    logger.info("Content seeding completed. Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    logger.error("Content seed failed:", error);
    process.exit(1);
  }
};

seedContent();
