import * as db from '../db/queries.js';

export const loadStoreItems = async (req, res) => {
    const storeItems = await db.getAllStoreItems();
}