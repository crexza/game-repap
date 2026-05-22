import jwt from 'jsonwebtoken'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is missing from backend/.env')
  }

  return secret
}

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    getJwtSecret(),
    {
      expiresIn: '7d'
    }
  )
}

export function requireAuth(req, res, next) {
  const authorizationHeader = req.headers.authorization || ''
  const token = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : ''

  if (!token) {
    return res.status(401).json({
      message: 'Please log in to continue.'
    })
  }

  try {
    req.user = jwt.verify(token, getJwtSecret())
    next()
  } catch {
    return res.status(401).json({
      message: 'Your session is invalid or has expired. Please log in again.'
    })
  }
}