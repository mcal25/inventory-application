import { pool } from './pool.js';

export async function getAllStoreItems() {
    const { rows } = await pool.query('SELECT * FROM items');
    return rows;
}

export async function getAllStoreCategories() {
    const { rows } = await pool.query('SELECT * FROM categories');
    console.log(rows);
    return rows;
}

export async function getSpecificStoreCategory(category) {
    const { rows } = await pool.query(`
        SELECT items.* FROM items
          JOIN categories ON category_id = categories.id
          WHERE categories.name ILIKE $1
        `, [`%${category}%`]);
    return rows;
}



