#! /usr/bin/env node

import pg from "pg";
const { Client } = pg;

// Drop existing tables first so schema updates (like UNIQUE constraints) actually apply
const SCHEMA_SQL = `
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 1. Create categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Create items table with UNIQUE name constraint enforced
CREATE TABLE items (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL UNIQUE,
  price NUMERIC(10, 2),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  quantity INTEGER,
  desired_quantity INTEGER
);
`;

// 10 categories x 20 items = 200 items
const categoriesData = [
  {
    name: "Electronics",
    items: [
      { name: "Wireless Headphones", min: 49.99, max: 149.99 },
      { name: "Gaming Monitor", min: 149.99, max: 349.99 },
      { name: "Mechanical Keyboard", min: 49.99, max: 129.99 },
      { name: "Smartwatch", min: 129.99, max: 299.99 },
      { name: "Tablet 10-inch", min: 99.99, max: 249.99 },
      { name: "Bluetooth Speaker", min: 24.99, max: 69.99 },
      { name: "Wi-Fi Router", min: 39.99, max: 119.99 },
      { name: "4K Webcam", min: 49.99, max: 99.99 },
      { name: "USB-C Fast Charger", min: 12.99, max: 24.99 },
      { name: "Power Bank 20000mAh", min: 19.99, max: 44.99 },
      { name: "HDMI Cable 6ft", min: 5.99, max: 11.99 },
      { name: "Smart TV 55-inch", min: 279.99, max: 549.99 },
      { name: "Noise Canceling Earbuds", min: 79.99, max: 179.99 },
      { name: "1TB External SSD", min: 69.99, max: 109.99 },
      { name: "16GB RAM Kit", min: 34.99, max: 69.99 },
      { name: "Graphics Card", min: 299.99, max: 699.99 },
      { name: "USB Microphone", min: 34.99, max: 89.99 },
      { name: "Mini Drone", min: 39.99, max: 129.99 },
      { name: "VR Headset", min: 249.99, max: 449.99 },
      { name: "E-Reader", min: 79.99, max: 139.99 },
    ],
  },
  {
    name: "Books",
    items: [
      { name: "Sci-Fi Epic Novel", min: 12.99, max: 18.99 },
      { name: "World History Hardcover", min: 24.99, max: 39.99 },
      { name: "Modern Cookery Guide", min: 18.99, max: 29.99 },
      { name: "Self-Help Best Seller", min: 11.99, max: 16.99 },
      { name: "Mystery Thriller", min: 8.99, max: 14.99 },
      { name: "Fantasy Trilogy Vol. 1", min: 12.99, max: 19.99 },
      { name: "Financial Freedom Handbook", min: 14.99, max: 22.99 },
      { name: "Philosophy Essentials", min: 13.99, max: 21.99 },
      { name: "Psychology 101", min: 15.99, max: 24.99 },
      { name: "Art History Illustrated", min: 29.99, max: 49.99 },
      { name: "Classic Poetry Collection", min: 9.99, max: 15.99 },
      { name: "Graphic Novel Anthology", min: 16.99, max: 27.99 },
      { name: "Manga Vol. 1", min: 8.99, max: 12.99 },
      { name: "Travel Around the World", min: 17.99, max: 26.99 },
      { name: "Children's Bedtime Stories", min: 7.99, max: 13.99 },
      { name: "Biographical Memoir", min: 14.99, max: 24.99 },
      { name: "Coding for Beginners", min: 19.99, max: 34.99 },
      { name: "Astronomy Handbook", min: 18.99, max: 28.99 },
      { name: "Gardening Fundamentals", min: 13.99, max: 21.99 },
      { name: "Fitness and Nutrition", min: 12.99, max: 19.99 },
    ],
  },
  {
    name: "Groceries",
    items: [
      { name: "Organic Whole Milk", min: 3.49, max: 4.99 },
      { name: "Artisanal Sourdough Bread", min: 3.99, max: 5.99 },
      { name: "Large Grade A Eggs", min: 2.99, max: 4.49 },
      { name: "Aged Cheddar Cheese", min: 4.49, max: 6.99 },
      { name: "Dark Roast Coffee Beans", min: 9.99, max: 14.99 },
      { name: "Green Tea Bags", min: 3.29, max: 4.99 },
      { name: "Jasmine Rice 5lb", min: 6.99, max: 9.99 },
      { name: "Penne Pasta 16oz", min: 1.29, max: 2.29 },
      { name: "Boneless Chicken Breast", min: 6.99, max: 11.99 },
      { name: "Ground Beef 80/20", min: 5.49, max: 8.49 },
      { name: "Rolled Oats 32oz", min: 3.49, max: 4.99 },
      { name: "Greek Yogurt", min: 3.99, max: 5.49 },
      { name: "Unsalted Butter", min: 3.49, max: 4.99 },
      { name: "Gala Apples 3lb", min: 3.99, max: 5.99 },
      { name: "Organic Bananas", min: 1.29, max: 1.99 },
      { name: "Roma Tomatoes 1lb", min: 1.49, max: 2.49 },
      { name: "Whole Grain Cereal", min: 3.99, max: 5.49 },
      { name: "Orange Juice 64oz", min: 3.49, max: 4.99 },
      { name: "Extra Virgin Olive Oil", min: 8.99, max: 14.99 },
      { name: "Dark Chocolate 70%", min: 2.49, max: 3.99 },
    ],
  },
  {
    name: "Clothing",
    items: [
      { name: "Cotton Crewneck T-Shirt", min: 12.99, max: 24.99 },
      { name: "Slim Fit Denim Jeans", min: 29.99, max: 59.99 },
      { name: "Pullover Fleece Hoodie", min: 24.99, max: 44.99 },
      { name: "Winter Down Jacket", min: 79.99, max: 149.99 },
      { name: "Ankle Socks 6-Pack", min: 8.99, max: 14.99 },
      { name: "Running Sneakers", min: 49.99, max: 99.99 },
      { name: "Leather Ankle Boots", min: 69.99, max: 129.99 },
      { name: "Casual Summer Dress", min: 24.99, max: 49.99 },
      { name: "Athletic Shorts", min: 14.99, max: 29.99 },
      { name: "Knit Crew Sweater", min: 29.99, max: 54.99 },
      { name: "Leather Belt", min: 14.99, max: 29.99 },
      { name: "Baseball Cap", min: 12.99, max: 22.99 },
      { name: "Thermal Gloves", min: 9.99, max: 19.99 },
      { name: "Wool Scarf", min: 14.99, max: 27.99 },
      { name: "Waterproof Raincoat", min: 39.99, max: 79.99 },
      { name: "One-Piece Swimsuit", min: 22.99, max: 44.99 },
      { name: "Flannel Pajama Set", min: 24.99, max: 39.99 },
      { name: "Ribbed Tank Top", min: 8.99, max: 16.99 },
      { name: "Leather Sandals", min: 24.99, max: 49.99 },
      { name: "Tailored Blazer", min: 59.99, max: 119.99 },
    ],
  },
  {
    name: "Home & Kitchen",
    items: [
      { name: "High-Speed Blender", min: 39.99, max: 89.99 },
      { name: "Drip Coffee Maker", min: 24.99, max: 59.99 },
      { name: "Countertop Microwave", min: 59.99, max: 119.99 },
      { name: "2-Slice Toaster", min: 14.99, max: 29.99 },
      { name: "Cordless Stick Vacuum", min: 79.99, max: 169.99 },
      { name: "Digital Air Fryer", min: 49.99, max: 99.99 },
      { name: "Nonstick Frying Pan 10-inch", min: 14.99, max: 29.99 },
      { name: "Stainless Steel Stock Pot", min: 24.99, max: 49.99 },
      { name: "Chef Knife 8-inch", min: 19.99, max: 44.99 },
      { name: "Bamboo Cutting Board", min: 11.99, max: 22.99 },
      { name: "Bath Towel 4-Pack", min: 19.99, max: 34.99 },
      { name: "Memory Foam Pillow", min: 19.99, max: 39.99 },
      { name: "LED Desk Lamp", min: 14.99, max: 27.99 },
      { name: "Digital Wall Clock", min: 12.99, max: 24.99 },
      { name: "Stainless Steel Trash Can", min: 29.99, max: 59.99 },
      { name: "Ceramic Coffee Mug", min: 6.99, max: 12.99 },
      { name: "Dinnerware Set 16-Piece", min: 39.99, max: 79.99 },
      { name: "20-Piece Flatware Set", min: 19.99, max: 39.99 },
      { name: "Area Rug 5x7", min: 49.99, max: 119.99 },
      { name: "Microfiber Sheet Set", min: 19.99, max: 34.99 },
    ],
  },
  {
    name: "Toys & Games",
    items: [
      { name: "Strategy Board Game", min: 24.99, max: 44.99 },
      { name: "1000-Piece Jigsaw Puzzle", min: 9.99, max: 17.99 },
      { name: "Superhero Action Figure", min: 11.99, max: 19.99 },
      { name: "500-Piece Building Blocks", min: 24.99, max: 49.99 },
      { name: "Standard Playing Cards", min: 2.99, max: 5.99 },
      { name: "Plush Teddy Bear", min: 12.99, max: 22.99 },
      { name: "Remote Control Car", min: 19.99, max: 39.99 },
      { name: "Classic Yo-Yo", min: 4.99, max: 9.99 },
      { name: "Fashion Doll", min: 14.99, max: 24.99 },
      { name: "Wooden Stacking Blocks", min: 12.99, max: 21.99 },
      { name: "Foam Dart Blaster", min: 14.99, max: 29.99 },
      { name: "Marble Run Set", min: 18.99, max: 32.99 },
      { name: "Stunt Kite", min: 9.99, max: 18.99 },
      { name: "Scale Model Kit", min: 16.99, max: 29.99 },
      { name: "Glow-in-the-Dark Slime", min: 6.99, max: 12.99 },
      { name: "Electric Train Set", min: 39.99, max: 89.99 },
      { name: "Super Soaker Water Gun", min: 11.99, max: 22.99 },
      { name: "Memory Match Game", min: 7.99, max: 13.99 },
      { name: "Dominoes Set", min: 8.99, max: 15.99 },
      { name: "Wooden Chess Set", min: 14.99, max: 29.99 },
    ],
  },
  {
    name: "Sports & Outdoors",
    items: [
      { name: "Non-Slip Yoga Mat", min: 14.99, max: 29.99 },
      { name: "Adjustable Dumbbell Set", min: 49.99, max: 119.99 },
      { name: "Official Size Basketball", min: 14.99, max: 29.99 },
      { name: "Soccer Ball", min: 12.99, max: 24.99 },
      { name: "4-Person Camping Tent", min: 59.99, max: 129.99 },
      { name: "Thermal Sleeping Bag", min: 29.99, max: 59.99 },
      { name: "21-Speed Mountain Bike", min: 179.99, max: 349.99 },
      { name: "Insulated Stainless Water Bottle", min: 12.99, max: 24.99 },
      { name: "Resistance Bands Set", min: 11.99, max: 22.99 },
      { name: "Speed Jump Rope", min: 6.99, max: 12.99 },
      { name: "Graphite Tennis Racket", min: 34.99, max: 69.99 },
      { name: "Complete Skateboard", min: 29.99, max: 59.99 },
      { name: "Telescopic Fishing Rod", min: 24.99, max: 49.99 },
      { name: "Golf Driver", min: 79.99, max: 169.99 },
      { name: "30L Hiking Backpack", min: 34.99, max: 69.99 },
      { name: "Bicycle Helmet", min: 19.99, max: 39.99 },
      { name: "Trail Running Shoes", min: 59.99, max: 109.99 },
      { name: "Waterproof Hiking Boots", min: 69.99, max: 129.99 },
      { name: "Swim Goggles", min: 8.99, max: 16.99 },
      { name: "Handheld Compass", min: 6.99, max: 12.99 },
    ],
  },
  {
    name: "Beauty & Personal Care",
    items: [
      { name: "Hydrating Shampoo", min: 6.99, max: 12.99 },
      { name: "Nourishing Conditioner", min: 6.99, max: 12.99 },
      { name: "Exfoliating Body Wash", min: 4.99, max: 8.99 },
      { name: "Fluoride Free Toothpaste", min: 3.49, max: 5.99 },
      { name: "Daily Face Lotion", min: 8.99, max: 16.99 },
      { name: "Broad Spectrum Sunscreen SPF 50", min: 9.99, max: 15.99 },
      { name: "Eau de Parfum 50ml", min: 34.99, max: 79.99 },
      { name: "Gentle Cleansing Face Wash", min: 7.99, max: 14.99 },
      { name: "Moisturizing Lip Balm", min: 2.49, max: 4.99 },
      { name: "Detangling Hairbrush", min: 6.99, max: 12.99 },
      { name: "Safety Razor", min: 14.99, max: 29.99 },
      { name: "Natural Deodorant", min: 5.99, max: 9.99 },
      { name: "Quick-Dry Nail Polish", min: 3.99, max: 7.99 },
      { name: "Hydrating Sheet Mask 5-Pack", min: 7.99, max: 13.99 },
      { name: "Shea Butter Hand Cream", min: 5.99, max: 10.99 },
      { name: "Organic Bar Soap", min: 3.49, max: 5.99 },
      { name: "Cedarwood Beard Oil", min: 9.99, max: 17.99 },
      { name: "Ionic Hair Dryer", min: 24.99, max: 49.99 },
      { name: "Makeup Brush Set", min: 11.99, max: 24.99 },
      { name: "Organic Cotton Swabs", min: 2.99, max: 4.99 },
    ],
  },
  {
    name: "Automotive",
    items: [
      { name: "Foaming Car Wash Soap", min: 6.99, max: 11.99 },
      { name: "Synthetic Motor Oil 5W-30", min: 22.99, max: 32.99 },
      { name: "All-Weather Wiper Blades", min: 11.99, max: 19.99 },
      { name: "Heavy-Duty Floor Mats", min: 24.99, max: 49.99 },
      { name: "Digital Tire Pressure Gauge", min: 8.99, max: 15.99 },
      { name: "Heavy-Duty Jumper Cables", min: 14.99, max: 27.99 },
      { name: "1080p Dash Cam", min: 34.99, max: 69.99 },
      { name: "Neoprene Seat Covers", min: 39.99, max: 79.99 },
      { name: "Car Air Freshener 4-Pack", min: 4.99, max: 8.99 },
      { name: "12V Car Battery", min: 89.99, max: 149.99 },
      { name: "Microfiber Towels 12-Pack", min: 9.99, max: 16.99 },
      { name: "Windshield Washer Fluid", min: 3.49, max: 5.99 },
      { name: "Flexible Oil Funnel", min: 3.99, max: 7.99 },
      { name: "Car Emergency Roadside Kit", min: 29.99, max: 49.99 },
      { name: "Iridium Spark Plugs 4-Pack", min: 19.99, max: 34.99 },
      { name: "Carnauba Car Wax", min: 9.99, max: 17.99 },
      { name: "Portable Tire Inflator", min: 24.99, max: 44.99 },
      { name: "100-Piece Mechanics Tool Set", min: 49.99, max: 89.99 },
      { name: "Ice Scraper and Snow Brush", min: 7.99, max: 13.99 },
      { name: "Leather Steering Wheel Cover", min: 11.99, max: 19.99 },
    ],
  },
  {
    name: "Gardening",
    items: [
      { name: "Ceramic Plant Pot 8-inch", min: 12.99, max: 22.99 },
      { name: "Organic Potting Soil 20qt", min: 7.99, max: 12.99 },
      { name: "Stainless Steel Watering Can", min: 14.99, max: 24.99 },
      { name: "Heavy-Duty Garden Hose 50ft", min: 24.99, max: 44.99 },
      { name: "Bypass Pruning Shears", min: 11.99, max: 19.99 },
      { name: "Rubber Coated Gardening Gloves", min: 5.99, max: 10.99 },
      { name: "All-Purpose Plant Fertilizer", min: 8.99, max: 14.99 },
      { name: "Heirloom Vegetable Seeds", min: 2.49, max: 4.99 },
      { name: "Hand Trowel", min: 6.99, max: 11.99 },
      { name: "Garden Hand Rake", min: 6.99, max: 11.99 },
      { name: "Folding Garden Shovel", min: 12.99, max: 21.99 },
      { name: "Solar Garden Stake Lights 6-Pack", min: 17.99, max: 29.99 },
      { name: "Electric Lawn Mower", min: 149.99, max: 279.99 },
      { name: "Oscillating Lawn Sprinkler", min: 14.99, max: 24.99 },
      { name: "Tiered Plant Stand", min: 24.99, max: 49.99 },
      { name: "Cordless Weed Eater", min: 59.99, max: 119.99 },
      { name: "Garden Trellis 6ft", min: 16.99, max: 29.99 },
      { name: "Multi-Pattern Hose Nozzle", min: 8.99, max: 14.99 },
      { name: "Outdoor Compost Bin", min: 39.99, max: 79.99 },
      { name: "Heavy-Duty Wheelbarrow", min: 59.99, max: 109.99 },
    ],
  },
];

function getRandomPrice(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("seeding...");
  const connectionString =
    process.argv[2] ||
    process.env.DATABASE_URL ||
    "postgresql://cc:DankDBPW@localhost:5432/inventory";
  const client = new Client({ connectionString });

  try {
    await client.connect();

    // 1. Re-create database tables with strict schema constraints
    await client.query(SCHEMA_SQL);

    // 2. Insert Categories
    const categoryNames = categoriesData
      .map((c) => `('${c.name}')`)
      .join(",\n  ");
    const categoriesSQL = `
      INSERT INTO categories (name) 
      VALUES ${categoryNames}
      ON CONFLICT (name) DO NOTHING;
    `;
    await client.query(categoriesSQL);

    // 3. Construct Bulk Items SQL Insert with deduplication check
    const itemValues = [];
    const seenNames = new Set();

    for (const cat of categoriesData) {
      for (const item of cat.items) {
        if (seenNames.has(item.name)) continue;
        seenNames.add(item.name);

        const price = getRandomPrice(item.min, item.max);
        const quantity = getRandomInt(2, 40);
        const desiredQuantity = getRandomInt(10, 50);

        const escapedItemName = item.name.replace(/'/g, "''");
        const escapedCatName = cat.name.replace(/'/g, "''");

        itemValues.push(
          `('${escapedItemName}', ${price}, (SELECT id FROM categories WHERE name = '${escapedCatName}'), ${quantity}, ${desiredQuantity})`,
        );
      }
    }

    const itemsSQL = `
      INSERT INTO items (name, price, category_id, quantity, desired_quantity)
      VALUES 
        ${itemValues.join(",\n        ")}
      ON CONFLICT (name) DO NOTHING;
    `;

    await client.query(itemsSQL);

    const res = await client.query("SELECT COUNT(*) FROM items;");
    console.log(
      `✅ Successfully seeded! Total unique items in DB: ${res.rows[0].count}`,
    );
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  } finally {
    await client.end();
    console.log("done");
  }
}

main();
