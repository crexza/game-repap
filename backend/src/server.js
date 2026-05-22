import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool, initialiseDatabase } from './db.js'

const app = express()
const port = Number(process.env.PORT) || 3000

const allowedOrigins = (
  process.env.FRONTEND_URL || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      // Allow browser requests from the Vue frontend
      // Also allow requests without origin, such as direct browser API testing
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('This frontend origin is not allowed by the API.'))
      }
    }
  })
)

app.use(express.json())

// Convert PostgreSQL numeric values into normal JavaScript numbers
function formatProduct(product) {
  return {
    ...product,
    price: Number(product.price),
    rating: Number(product.rating)
  }
}

// Main backend route
app.get('/', (_req, res) => {
  res.json({
    application: 'GameVault API',
    message: 'Backend is running. Use /api/products to view game data.'
  })
})

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    application: 'GameVault API',
    database: 'Supabase PostgreSQL'
  })
})

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { platform = '', search = '', featured = '' } = req.query

    const values = []
    const filters = []

    if (platform && platform !== 'All') {
      values.push(platform)
      filters.push(`platform = $${values.length}`)
    }

    if (search) {
      values.push(`%${search}%`)
      filters.push(
        `(title ILIKE $${values.length} OR genre ILIKE $${values.length})`
      )
    }

    if (featured === 'true') {
      filters.push('featured = TRUE')
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''

    const result = await pool.query(
      `
      SELECT *
      FROM products
      ${whereClause}
      ORDER BY featured DESC, title ASC
      `,
      values
    )

    res.json(result.rows.map(formatProduct))
  } catch (error) {
    console.error('Unable to load products:', error.message)

    res.status(500).json({
      message: 'Unable to load products.'
    })
  }
})

// Get one product for the Product Detail page
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id)

    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({
        message: 'Invalid game ID.'
      })
    }

    const result = await pool.query(
      `
      SELECT *
      FROM products
      WHERE id = $1
      `,
      [productId]
    )

    if (!result.rows[0]) {
      return res.status(404).json({
        message: 'Game not found.'
      })
    }

    res.json(formatProduct(result.rows[0]))
  } catch (error) {
    console.error('Unable to load product:', error.message)

    res.status(500).json({
      message: 'Unable to load product.'
    })
  }
})

// Handle unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    message: 'API route not found.'
  })
})

// Handle server errors such as blocked CORS origins
app.use((error, _req, res, _next) => {
  console.error('Server error:', error.message)

  res.status(500).json({
    message: 'Server error. Please try again later.'
  })
})

// Start backend after preparing database tables and initial product data
try {
  await initialiseDatabase()

  app.listen(port, '0.0.0.0', () => {
    console.log(`GameVault API is running at http://localhost:${port}`)
  })
} catch (error) {
  console.error('Unable to start backend:', error.message)
  process.exit(1)
}