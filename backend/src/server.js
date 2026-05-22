import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool, initialiseDatabase } from './db.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    application: 'GameVault API',
    database: 'Supabase PostgreSQL'
  });
});

app.get('/api/products', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM products
      ORDER BY featured DESC, title ASC
    `);

    const products = result.rows.map(product => ({
      ...product,
      price: Number(product.price),
      rating: Number(product.rating)
    }));

    res.json(products);
  } catch (error) {
    console.error('Unable to load products:', error.message);

    res.status(500).json({
      message: 'Unable to load products.'
    });
  }
});

try {
  await initialiseDatabase();

  app.listen(port, () => {
    console.log(`GameVault API is running at http://localhost:${port}`);
  });
} catch (error) {
  console.error('Unable to start backend:', error.message);
}