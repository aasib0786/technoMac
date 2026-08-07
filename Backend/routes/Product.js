const express = require('express');
const productRouter = express.Router();
const upload = require('../middleware/multer');
const adminAuth = require('../middleware/adminAuth');
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getProductsBySubCategory,
  getProductsByParentCategory,
  getFeaturedProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require('../controller/Product');

productRouter.post('/', adminAuth, upload.array('images', 10), createProduct);
productRouter.get('/', getAllProducts);
productRouter.get('/featured', getFeaturedProducts);
productRouter.get('/search', searchProducts);
productRouter.get('/slug/:slug', getProductBySlug);
productRouter.get('/by-parent/:parentId', getProductsByParentCategory);
productRouter.get('/by-category/:categoryId', getProductsByCategory);
productRouter.get('/by-subcategory/:subCategoryId', getProductsBySubCategory);
productRouter.get('/:id', getProductById);
productRouter.put('/:id', adminAuth, upload.array('images', 10), updateProduct);
productRouter.delete('/:id', adminAuth, deleteProduct);

module.exports.productRouter = productRouter;