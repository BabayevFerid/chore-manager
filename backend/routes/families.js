const express = require('express');
const { body, validationResult } = require('express-validator');
const { Family, User } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a family (only authenticated user)
router.post('/', authMiddleware, [
  body('name').isLength({ min: 1 }).withMessage('Family name required')
], async (req, res) => {
  // Optionally allow unauthenticated creation in other flows; here auth required
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name } = req.body;
    const code = name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 7);
    const family = await Family.create({ name, joinCode: code });

    // add creator to family and make admin
    const user = await User.findByPk(req.user.id);
    user.familyId = family.id;
    user.role = 'admin';
    await user.save();

    return res.json({ family });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Join by joinCode
router.post('/join', authMiddleware, [
  body('joinCode').isLength({ min: 3 }).withMessage('joinCode required')
], async (req, res) => {
  const { joinCode } = req.body;
  try {
    const family = await Family.findOne({ where: { joinCode } });
    if (!family) return res.status(404).json({ error: 'Family not found' });

    const user = await User.findByPk(req.user.id);
    user.familyId = family.id;
    user.role = 'member';
    await user.save();

    return res.json({ family, message: 'Joined family' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get family details + members (auth, must belong to family)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const family = await Family.findByPk(req.params.id, { include: [{ model: User, as: 'members', attributes: ['id','name','email','role'] }] });
    if (!family) return res.status(404).json({ error: 'Family not found' });

    // auth: user must belong to this family or be admin? We'll require same family
    if (req.user.familyId !== family.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ family });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
