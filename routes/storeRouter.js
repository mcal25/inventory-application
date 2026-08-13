import { Router } from 'express';
import { loadStoreItems } from '../controllers/storeController';

const storeRouter = Router();

storeRouter.get('/', (req, res) => {
    loadStoreItems();
    res.render('index');
});

export { storeRouter };