import { json, Router } from "express";
import {
  loadStoreCategories,
  loadStoreItems,
} from "../controllers/storeController.js";
import {
  getAllStoreCategories,
  getAllStoreItems,
  getSpecificStoreCategory,
  getSpecificStoreItem,
  getCategoryById,
  addCategory,
  addItem,
  deleteItem,
  getCategoryIdFromCategoryName,
  deleteCategory,
  deleteItemsOfCategory,
} from "../db/queries.js";

const storeRouter = Router();

storeRouter.get("/", async (req, res) => {
  const allStoreCategories = await getAllStoreCategories();
  loadStoreCategories();
  res.render("index", { allStoreCategories: allStoreCategories });
});

storeRouter.get("/new-category", (req, res) => {
  res.render("newCategoryForm");
});

storeRouter.get("/new-item", async (req, res) => {
  const allStoreCategories = await getAllStoreCategories();
  res.render("newItemForm", { allStoreCategories: allStoreCategories });
});

storeRouter.get("/:category", async (req, res) => {
  const { category } = req.params;
  // console.log('category:', category);
  // console.log('function call', await getSpecificStoreCategory(category));
  const items = await getSpecificStoreCategory(category);
  // console.log('this is items', items);
  res.render("category", { category: category, items: items });
});

storeRouter.get("/:category/:item", async (req, res) => {
  const { category } = req.params;
  const { item } = req.params;
  const itemInfo = await getSpecificStoreItem(item);
  console.log("Item info: ", itemInfo);
  res.render("item", { category: category, item: item, itemInfo: itemInfo });
});

storeRouter.post("/new-category", async (req, res) => {
  await addCategory(req.body.categoryName);
  res.redirect("/");
});

storeRouter.post("/new-item", async (req, res) => {
  const {
    itemName,
    itemPrice,
    categorySelect,
    itemQuantity,
    itemDesiredQuantity,
  } = req.body;
  await addItem(
    itemName,
    itemPrice,
    categorySelect,
    itemQuantity,
    itemDesiredQuantity,
  );
  const category = await getCategoryById(categorySelect);
  res.redirect(`/${category.name}`);
});

storeRouter.post("/delete-item", async (req, res) => {
  const { itemId, category } = req.body;
  await deleteItem(itemId);
  res.redirect(`/${category}`);
});

storeRouter.post('/delete-category', async (req, res) => {
  const { category } = req.body;
  await deleteItemsOfCategory(await getCategoryIdFromCategoryName(category));
  await deleteCategory(category);
  res.redirect('/');
});

export { storeRouter };
