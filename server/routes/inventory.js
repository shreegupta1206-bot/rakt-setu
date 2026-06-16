const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const BloodInventory = require('../models/BloodInventory');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await BloodInventory.find({ blood_bank_id: req.user.userId }).sort('blood_group');
    res.json(items.map(i => ({ ...i.toObject(), id: String(i._id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { units } = req.body;
    if (units === undefined || units < 0) return res.status(400).json({ error: 'Valid units required' });
    const item = await BloodInventory.findOneAndUpdate(
      { _id: req.params.id, blood_bank_id: req.user.userId },
      { units },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ ...item.toObject(), id: String(item._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
