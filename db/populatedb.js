#! /usr/bin/env node

const { Client } = require('pg');

const SQL = `
-- 1. Create categories table first
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Create items table with foreign key reference
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255),
  price NUMERIC(10, 2),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  quantity INTEGER,
  desired_quantity INTEGER
);

-- 3. Seed initial categories (ON CONFLICT prevents duplicate key errors if re-run)
INSERT INTO categories (name) 
VALUES
  ('Electronics'),
  ('Books'),
  ('Groceries')
ON CONFLICT (name) DO NOTHING;

-- 4. Seed items using subqueries to grab the correct dynamic category_id
INSERT INTO items (name, price, category_id, quantity, desired_quantity) 
VALUES
  ('Laptop', 999.99, (SELECT id FROM categories WHERE name = 'Electronics'), 5, 10),
  ('Wireless Mouse', 29.99, (SELECT id FROM categories WHERE name = 'Electronics'), 15, 20),
  ('The Hobbit', 14.99, (SELECT id FROM categories WHERE name = 'Books'), 8, 15),
  ('Apples (1lb)', 2.49, (SELECT id FROM categories WHERE name = 'Groceries'), 25, 30);
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    // Uses command line argument if provided (e.g. node populatedb.js "postgresql://..."), 
    // otherwise falls back to default URI string
    connectionString: process.argv[2] || "postgresql://cc:DankDBPW@localhost:5432/top_users",
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();