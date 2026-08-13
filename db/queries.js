import { pool } from './pool.js';

export async function getAllStoreItems() {
    const { rows } = await pool.query('SELECT * FROM items');
    console.log(rows);
    return rows;
}