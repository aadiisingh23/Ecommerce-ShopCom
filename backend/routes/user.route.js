import express from 'express';
import { getUser, loginUser,registerUser, verifyOTP } from '../controller/auth.controller.js';
import protect from '../middleware/auth.middleware.js';
import admin from '../middleware/admin.middleware.js';


const router = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/users',protect,admin,getUser)
router.post('/verify-otp',protect,verifyOTP)

export default router;