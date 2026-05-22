import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from backend/.env');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const seedProducts = [
  {
    title: 'Marvel Spider-Man 2',
    platform: 'PS5',
    genre: 'Action',
    price: 249.0,
    stock: 12,
    rating: 4.9,
    description:
      'Swing through New York as Peter Parker and Miles Morales in an exciting superhero adventure.',
    imageEmoji: '🕷️',
    featured: true
  },
  {
    title: 'Final Fantasy VII Rebirth',
    platform: 'PS5',
    genre: 'RPG',
    price: 279.0,
    stock: 8,
    rating: 4.8,
    description:
      'Explore a massive world with Cloud and his friends in an unforgettable RPG journey.',
    imageEmoji: '⚔️',
    featured: true
  },
  {
    title: 'EA Sports FC 25',
    platform: 'PS5',
    genre: 'Sports',
    price: 219.0,
    stock: 20,
    rating: 4.5,
    description:
      'Build your dream football squad and compete in exciting match modes.',
    imageEmoji: '⚽',
    featured: false
  },
  {
    title: 'God of War Ragnarok',
    platform: 'PS4',
    genre: 'Action',
    price: 169.0,
    stock: 10,
    rating: 4.9,
    description:
      'Join Kratos and Atreus in an emotional journey through the Norse realms.',
    imageEmoji: '🪓',
    featured: true
  },
  {
    title: 'The Last of Us Part II',
    platform: 'PS4',
    genre: 'Adventure',
    price: 109.0,
    stock: 7,
    rating: 4.7,
    description:
      'A story-driven survival adventure with intense combat and exploration.',
    imageEmoji: '🌿',
    featured: false
  },
  {
    title: 'Gran Turismo 7',
    platform: 'PS4',
    genre: 'Racing',
    price: 129.0,
    stock: 14,
    rating: 4.6,
    description:
      'Race, customise and collect iconic vehicles across legendary tracks.',
    imageEmoji: '🏎️',
    featured: false
  },
  {
    title: 'The Legend of Zelda: Tears of the Kingdom',
    platform: 'Switch',
    genre: 'Adventure',
    price: 239.0,
    stock: 15,
    rating: 4.9,
    description:
      'Explore Hyrule and use creative abilities in a huge open-world adventure.',
    imageEmoji: '🗡️',
    featured: true
  },
  {
    title: 'Mario Kart 8 Deluxe',
    platform: 'Switch',
    genre: 'Racing',
    price: 189.0,
    stock: 25,
    rating: 4.8,
    description:
      'Enjoy colourful kart racing with friends in local and online multiplayer.',
    imageEmoji: '🏁',
    featured: true
  },
  {
    title: 'Super Mario Bros. Wonder',
    platform: 'Switch',
    genre: 'Platformer',
    price: 209.0,
    stock: 16,
    rating: 4.8,
    description:
      'A colourful Mario platforming adventure packed with surprising Wonder effects.',
    imageEmoji: '🍄',
    featured: false
  }
];

export async function initialiseDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL UNIQUE,
      platform VARCHAR(20) NOT NULL
        CHECK (platform IN ('PS4', 'PS5', 'Switch')),
      genre VARCHAR(60) NOT NULL,
      price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      rating NUMERIC(2, 1) NOT NULL DEFAULT 4.5
        CHECK (rating >= 0 AND rating <= 5),
      description TEXT NOT NULL,
      image_emoji VARCHAR(8) NOT NULL DEFAULT '🎮',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
      status VARCHAR(30) NOT NULL DEFAULT 'Paid',
      address TEXT NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      title VARCHAR(150) NOT NULL,
      platform VARCHAR(20) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0)
    );
  `);

    await pool.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS image_url TEXT;

    ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS image_url TEXT;
  `)

  for (const product of seedProducts) {
    await pool.query(
      `
      INSERT INTO products (
        title,
        platform,
        genre,
        price,
        stock,
        rating,
        description,
        image_emoji,
        featured
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (title) DO NOTHING
      `,
      [
        product.title,
        product.platform,
        product.genre,
        product.price,
        product.stock,
        product.rating,
        product.description,
        product.imageEmoji,
        product.featured
      ]
    );
  }

  const adminPassword = await bcrypt.hash('admin123', 10);

  await pool.query(
    `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, 'admin')
    ON CONFLICT (email) DO NOTHING
    `,
    ['GameVault Admin', 'admin@gamevault.my', adminPassword]
  );

  console.log('Database tables and seed data are ready.');
}