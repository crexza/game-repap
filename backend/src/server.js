import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool, initialiseDatabase } from './db.js'
import { createToken, requireAuth } from './auth.js'

const app = express()
const port = Number(process.env.PORT) || 3000

const allowedOrigins = (
  process.env.FRONTEND_URL || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('This frontend origin is not allowed by the API.'))
      }
    }
  })
)

app.use(express.json())

function formatProduct(product) {
  return {
    ...product,
    price: Number(product.price),
    rating: Number(product.rating)
  }
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  }
}

function formatOrder(order) {
  return {
    ...order,
    total: Number(order.total)
  }
}

// Main backend route
app.get('/', (_req, res) => {
  res.json({
    application: 'GameVault API',
    message: 'Backend is running. Use /api/products to view game data.'
  })
})

// Health check
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

// Get one product
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

// Register new customer account
app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (name.length < 2) {
      return res.status(400).json({
        message: 'Name must contain at least 2 characters.'
      })
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must contain at least 6 characters.'
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'customer')
      RETURNING id, name, email, role, created_at
      `,
      [name, email, passwordHash]
    )

    const user = formatUser(result.rows[0])

    res.status(201).json({
      message: 'Registration successful.',
      token: createToken(user),
      user
    })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      })
    }

    console.error('Registration failed:', error.message)

    res.status(500).json({
      message: 'Unable to register account.'
    })
  }
})

// Login customer or admin
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({
        message: 'Incorrect email or password.'
      })
    }

    const passwordCorrect = await bcrypt.compare(password, user.password_hash)

    if (!passwordCorrect) {
      return res.status(401).json({
        message: 'Incorrect email or password.'
      })
    }

    const safeUser = formatUser(user)

    res.json({
      message: 'Login successful.',
      token: createToken(safeUser),
      user: safeUser
    })
  } catch (error) {
    console.error('Login failed:', error.message)

    res.status(500).json({
      message: 'Unable to log in.'
    })
  }
})

// Get logged-in user profile
app.get('/api/users/profile', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    )

    if (!result.rows[0]) {
      return res.status(404).json({
        message: 'User account not found.'
      })
    }

    res.json(formatUser(result.rows[0]))
  } catch (error) {
    console.error('Unable to load profile:', error.message)

    res.status(500).json({
      message: 'Unable to load user profile.'
    })
  }
})

// Create customer order from shopping cart
app.post('/api/orders', requireAuth, async (req, res) => {
  const client = await pool.connect()

  try {
    const items = Array.isArray(req.body.items) ? req.body.items : []
    const address = String(req.body.address || '').trim()
    const paymentMethod = String(req.body.paymentMethod || '').trim()

    if (items.length === 0) {
      return res.status(400).json({
        message: 'Your cart is empty.'
      })
    }

    if (address.length < 10) {
      return res.status(400).json({
        message: 'Please enter a complete delivery address.'
      })
    }

    if (!['Online Banking', 'Credit / Debit Card', 'Cash on Delivery'].includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Please choose a valid payment method.'
      })
    }

    await client.query('BEGIN')

    let subtotal = 0
    const verifiedItems = []

    for (const item of items) {
      const productId = Number(item.productId)
      const quantity = Number(item.quantity)

      if (
        !Number.isInteger(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error('Invalid cart item.')
      }

      const productResult = await client.query(
        `
        SELECT *
        FROM products
        WHERE id = $1
        FOR UPDATE
        `,
        [productId]
      )

      const product = productResult.rows[0]

      if (!product) {
        throw new Error('One of the selected games no longer exists.')
      }

      if (product.stock < quantity) {
        throw new Error(`${product.title} does not have enough stock available.`)
      }

      subtotal += Number(product.price) * quantity

      verifiedItems.push({
        product,
        quantity
      })
    }

    const deliveryFee = subtotal >= 200 ? 0 : 10
    const total = subtotal + deliveryFee

    const orderResult = await client.query(
      `
      INSERT INTO orders (
        user_id,
        total,
        status,
        address,
        payment_method
      )
      VALUES ($1, $2, 'Paid', $3, $4)
      RETURNING *
      `,
      [req.user.id, total.toFixed(2), address, paymentMethod]
    )

    const order = orderResult.rows[0]

    for (const item of verifiedItems) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          title,
          platform,
          price,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          order.id,
          item.product.id,
          item.product.title,
          item.product.platform,
          item.product.price,
          item.quantity
        ]
      )

      await client.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.quantity, item.product.id]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({
      message: 'Order placed successfully.',
      order: {
        ...formatOrder(order),
        subtotal,
        delivery_fee: deliveryFee,
        items: verifiedItems.map((item) => ({
          product_id: item.product.id,
          title: item.product.title,
          platform: item.product.platform,
          price: Number(item.product.price),
          quantity: item.quantity
        }))
      }
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Unable to create order:', error.message)

    if (
      error.message.includes('stock') ||
      error.message.includes('selected games') ||
      error.message.includes('Invalid cart item')
    ) {
      return res.status(400).json({
        message: error.message
      })
    }

    res.status(500).json({
      message: 'Unable to place order.'
    })
  } finally {
    client.release()
  }
})

// Get logged-in customer's order history
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    )

    const orders = []

    for (const order of orderResult.rows) {
      const itemResult = await pool.query(
        `
        SELECT *
        FROM order_items
        WHERE order_id = $1
        ORDER BY id ASC
        `,
        [order.id]
      )

      orders.push({
        ...formatOrder(order),
        items: itemResult.rows.map((item) => ({
          ...item,
          price: Number(item.price)
        }))
      })
    }

    res.json(orders)
  } catch (error) {
    console.error('Unable to load order history:', error.message)

    res.status(500).json({
      message: 'Unable to load order history.'
    })
  }
})

// Handle unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    message: 'API route not found.'
  })
})

// General error handling
app.use((error, _req, res, _next) => {
  console.error('Server error:', error.message)

  res.status(500).json({
    message: 'Server error. Please try again later.'
  })
})

// Start backend
try {
  await initialiseDatabase()

  app.listen(port, '0.0.0.0', () => {
    console.log(`GameVault API is running at http://localhost:${port}`)
  })
} catch (error) {
  console.error('Unable to start backend:', error.message)
  process.exit(1)
}