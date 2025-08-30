const express = require('express');
const { body, validationResult } = require('express-validator');
const { Chore, User, Family } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a chore (only family members)
router.post('/', authMiddleware, [
  body('title').isLength({ min: 1 }).withMessage('Title required'),
  body('frequency').optional().isIn(['once','daily','weekly','monthly']).withMessage('Invalid frequency')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, description, frequency, dueDate, assignedToId } = req.body;

    if (!req.user.familyId) return res.status(400).json({ error: 'You must belong to a family to create chores' });

    // if assignedToId provided ensure the user is in same family
    if (assignedToId) {
      const assignee = await User.findByPk(assignedToId);
      if (!assignee || assignee.familyId !== req.user.familyId) {
        return res.status(400).json({ error: 'Assigned user not found in your family' });
      }
    }

    const chore = await Chore.create({
      title,
      description,
      frequency: frequency || 'once',
      dueDate: dueDate || null,
      familyId: req.user.familyId,
      assignedToId: assignedToId || null
    });

    return res.status(201).json({ chore });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// List chores for user's family (optionally filter by assignedToId or status)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.familyId) return res.json({ chores: [] });

    const where = { familyId: req.user.familyId };
    if (req.query.assignedToId) where.assignedToId = req.query.assignedToId;
    if (req.query.status) where.status = req.query.status;

    const chores = await Chore.findAll({
      where,
      include: [{ model: User, as: 'assignee', attributes: ['id','name','email'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ chores });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Mark chore as done
router.post('/:id/done', authMiddleware, async (req, res) => {
  try {
    const chore = await Chore.findByPk(req.params.id);
    if (!chore) return res.status(404).json({ error: 'Chore not found' });
    if (chore.familyId !== req.user.familyId) return res.status(403).json({ error: 'Access denied' });

    chore.status = 'done';
    await chore.save();
    return res.json({ chore });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Assign chore to a user (admin or family member)
router.post('/:id/assign', authMiddleware, [
  body('assignedToId').isInt().withMessage('assignedToId integer required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const chore = await Chore.findByPk(req.params.id);
    if (!chore) return res.status(404).json({ error: 'Chore not found' });
    if (chore.familyId !== req.user.familyId) return res.status(403).json({ error: 'Access denied' });

    const newAssignee = await User.findByPk(req.body.assignedToId);
    if (!newAssignee || newAssignee.familyId !== req.user.familyId) {
      return res.status(400).json({ error: 'Assignee not found in family' });
    }

    chore.assignedToId = req.body.assignedToId;
    chore.status = 'pending';
    await chore.save();

    return res.json({ chore });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Simple "auto assign" round-robin endpoint
router.post('/auto-assign', authMiddleware, async (req, res) => {
  // assign all unassigned chores in family round-robin among active members
  try {
    if (!req.user.familyId) return res.status(400).json({ error: 'You must belong to a family' });

    const members = await User.findAll({ where: { familyId: req.user.familyId }, order: [['id', 'ASC']] });
    if (!members || members.length === 0) return res.status(400).json({ error: 'No members in family' });

    const unassigned = await Chore.findAll({ where: { familyId: req.user.familyId, assignedToId: null } });
    if (!unassigned || unassigned.length === 0) return res.json({ message: 'No unassigned chores' });

    let idx = 0;
    for (const chore of unassigned) {
      const assignee = members[idx % members.length];
      chore.assignedToId = assignee.id;
      await chore.save();
      idx++;
    }

    const chores = await Chore.findAll({ where: { familyId: req.user.familyId }, include: [{ model: User, as: 'assignee', attributes: ['id','name'] }] });
    return res.json({ chores });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
