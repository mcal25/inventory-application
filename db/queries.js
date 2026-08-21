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

export async function updateCategory(newCategoryName, currentId) {
  await pool.query(
    `
    UPDATE categories
    SET name = $1
    WHERE id = $2;
    `,
    [newCategoryName, currentId],
  );
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

export async function deleteItem(item) {
  await pool.query(
    `
    DELETE FROM items
    WHERE id = $1;
  `,
    [item],
  );
}


export async function getCategoryIdFromCategoryName(category) {
  return (await pool.query(
    `
    SELECT id FROM categories
    WHERE name = $1;
    `,
    [category],
  )).rows[0].id;
}

export async function deleteCategory(category) {
  await pool.query(
    `
    DELETE FROM categories
    WHERE name ILIKE $1;
    `,
    [category],
  );
}

/**
 * call this before deleting the category or unintended consequences!
 * @param {*} category 
 */
export async function deleteItemsOfCategory(categoryId) {
  await pool.query(
    `
    DELETE FROM items
    WHERE category_id = $1;
    `,
    [categoryId],
  );
}