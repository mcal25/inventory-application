import { pool } from "./pool.js";

export async function getAllStoreItems() {
  const { rows } = await pool.query("SELECT * FROM items");
  return rows;
}

export async function getAllStoreCategories() {
  const { rows } = await pool.query("SELECT * FROM categories");
  console.log(rows);
  return rows;
}

export async function getSpecificStoreCategory(category) {
  const { rows } = await pool.query(
    `
        SELECT items.* FROM items
          JOIN categories ON category_id = categories.id
          WHERE categories.name ILIKE $1
        `,
    [`%${category}%`],
  );
  return rows;
}

export async function getCategoryById(id) {
  const { rows } = await pool.query("SELECT * FROM categories WHERE id = $1;", [
    id,
  ]);
  return rows[0];
}

export async function getSpecificStoreItem(item) {
  const { rows } = await pool.query(
    `
        SELECT items.*, categories.name AS category_name
          FROM items
          JOIN categories ON category_id = categories.id
          WHERE items.name ILIKE $1
        `,
    [`%${item}%`],
  );
  return rows[0];
}

export async function addCategory(category) {
  await pool.query(
    `
    INSERT INTO categories (name) 
    VALUES ($1);
  `,
    [category],
  );
  return category;
}

export async function addItem(
  name,
  price,
  categoryId,
  quantity,
  desiredQuantity,
) {
  await pool.query(
    `
    INSERT INTO items (name, price, category_id, quantity, desired_quantity) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `,
    [name, price, categoryId, quantity, desiredQuantity],
  );
  return [name, price, categoryId, quantity, desiredQuantity];
}

export async function deleteCategory(category) {}

export async function deleteItem(item) {
  await pool.query(
    `
    DELETE FROM items
    WHERE id = $1;
  `,
    [item],
  );
}
