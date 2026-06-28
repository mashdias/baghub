import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'BagHub Backend is running smoothly.' });
});

// Products API
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  // Needs admin auth middleware in a real scenario
  try {
    const { title, slug, description, price, stock, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { title, slug, description, price, stock, categoryId }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Custom Order Request
app.post('/api/custom-request', async (req: Request, res: Response) => {
  try {
    const { name, email, description, imageUrls } = req.body;
    const request = await prisma.customRequest.create({
      data: { name, email, description, imageUrls }
    });
    res.status(201).json({ message: 'Custom request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// Admin Dashboard Stats (Mock example)
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const pendingRequests = await prisma.customRequest.count({ where: { status: 'PENDING' } });
    
    res.json({
      totalOrders,
      totalProducts,
      pendingRequests,
      revenue: 125000 // Mock revenue in LKR
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.listen(PORT, () => {
  console.log(`BagHub server is running on http://localhost:${PORT}`);
});
