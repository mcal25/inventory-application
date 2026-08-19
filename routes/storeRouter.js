import { json, Router } from 'express';
import { loadStoreCategories, loadStoreItems } from '../controllers/storeController.js';
import { getAllStoreCategories, getAllStoreItems } from '../db/queries.js';

const storeRouter = Router();
const allStoreItems = await getAllStoreItems();
const allStoreCategories= await getAllStoreCategories();

storeRouter.get('/', (req, res) => {
    loadStoreCategories();
    res.render('index', { allStoreCategories: allStoreCategories});
});

export { storeRouter };