const jwt = require('jsonwebtoken');
const { User } = require('../db');

const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.scope('withPassword').findByPk(payload.id);
    if (!user) return res.status(401).json({ error: 'Invalid token (user not found)' });
    // attach user (sans password) to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      familyId: user.familyId
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
