const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Family } = require('../db');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
const jwtExpiry = '7d'; // token expiry

// Register user + optionally create or join family via joinCode
router.post('/register', [
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password 6+ chars')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, joinCode, createFamilyName } = req.body;

  try {
    // if email exists
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // Determine family
    let familyId = null;
    if (joinCode) {
      const fam = await Family.findOne({ where: { joinCode } });
      if (!fam) return res.status(400).json({ error: 'Invalid join code' });
      familyId = fam.id;
    } else if (createFamilyName) {
      // create family and set user as admin
      const code = createFamilyName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 7);
      const newFam = await Family.create({ name: createFamilyName, joinCode: code });
      familyId = newFam.id;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // first registered user in a family could be made admin; if familyId null, user is standalone
    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      familyId,
      role: familyId ? 'member' : 'admin'
    });

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpiry });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, familyId: user.familyId } });
  } catch (err) {
    console.error('REGISTER ERR', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await user.validatePassword(password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpiry });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, familyId: user.familyId } });
  } catch (err) {
    console.error('LOGIN ERR', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
