import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.route.js';
import ProductRouter from './routes/product.route.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();


const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();
// Routes
app.use('/api/auth',userRouter);
app.use('/api/products',ProductRouter);
// app.use('/api/orders',userRouter);
// app.use('/api/payment',userRouter);
// app.use('/api/analytics',userRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});