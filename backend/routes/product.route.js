import express from 'express';
import protect from '../middleware/auth.middleware.js';
import admin from '../middleware/admin.middleware.js';
import multer from 'multer'
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controller/product.controller.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// get all products by anyone 
router.route('/').get(getProducts).post(protect,admin,upload.single('image'),createProduct)
// single products details
router.route('/:id').get(getProductById).put(protect,admin,upload.single('image'),updateProduct).delete(protect,admin,deleteProduct);

export default router; 