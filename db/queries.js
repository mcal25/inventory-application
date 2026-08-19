import { pool } from './pool.js';

export async function getAllStoreItems() {
    const { rows } = await pool.query('SELECT * FROM items');
    console.log(rows);
    return rows;
}

export async function getAllStoreCategories() {
    const { rows } = await pool.query('SELECT * FROM categories');
    console.log(rows);
    return rows;
}

export async function getSpecificStoreCategory(category) {
    const { rows } = await pool.query(`
        SELECT * FROM items
          JOIN categories ON category_id = categories.id
          WHERE categories.name LIKE ${category}
        `);
        
    return rows;
}



