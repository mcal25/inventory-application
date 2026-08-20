import { json, Router } from 'express';
import { loadStoreCategories, loadStoreItems } from '../controllers/storeController.js';
import { getAllStoreCategories, getAllStoreItems, getSpecificStoreCategory, getSpecificStoreItem, addCategory } from '../db/queries.js';

const storeRouter = Router();
const allStoreItems = await getAllStoreItems();

storeRouter.get('/', async (req, res) => {
    const allStoreCategories = await getAllStoreCategories();
    loadStoreCategories();
    res.render('index', { allStoreCategories: allStoreCategories});
});

storeRouter.get('/new-category', (req, res) => {
    res.render('newCategoryForm');
});

storeRouter.get('/new-item', (req, res) => {
    res.render('newItemForm');
});

storeRouter.get('/:category', async (req, res) => {
    const { category } = req.params;
    // console.log('category:', category);
    // console.log('function call', await getSpecificStoreCategory(category));
    const items = await getSpecificStoreCategory(category);
    // console.log('this is items', items);
    res.render('category', {category: category, items: items});
});

storeRouter.get('/:category/:item', async (req, res) => {
    const { category } = req.params;
    const { item } = req.params;
    const itemInfo = await getSpecificStoreItem(item);
    console.log('Item info: ', itemInfo)
    res.render('item', {category: category, item: item, itemInfo: itemInfo});
});

storeRouter.post('/new-category', async (req, res) => {
    await addCategory(req.body.categoryName);
    res.redirect('/');
});

export { storeRouter };