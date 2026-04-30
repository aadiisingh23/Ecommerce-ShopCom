import express from 'express';
import protect from '../middleware/auth.middleware.js';
import admin from '../middleware/admin.middleware.js';

const router = express.Router();
// get all products by anyone 
router.route('/').get(getProduct).post(protect,admin,createProduct)
// single products details
router.route('/:id').get(getProduct).put(protect,admin,updateProduct).delete(protect,admin,deleteProduct);

export default router;