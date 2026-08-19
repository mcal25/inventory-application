import { json, Router } from 'express';
import { loadStoreCategories, loadStoreItems } from '../controllers/storeController.js';
import { getAllStoreCategories, getAllStoreItems, getSpecificStoreCategory } from '../db/queries.js';

const storeRouter = Router();
const allStoreItems = await getAllStoreItems();
const allStoreCategories= await getAllStoreCategories();

storeRouter.get('/', (req, res) => {
    loadStoreCategories();
    res.render('index', { allStoreCategories: allStoreCategories});
});

storeRouter.get('/:category', async (req, res) => {
    const { category } = req.params;
    console.log('category:', category);
    console.log('function call', await getSpecificStoreCategory(category));
    const items = await getSpecificStoreCategory(category);
    console.log('this is items', items);
    res.render('category', {category: category, items: items});
});

export { storeRouter };