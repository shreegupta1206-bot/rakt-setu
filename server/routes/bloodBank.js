const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const BloodBankProfile = require('../models/BloodBankProfile');

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await BloodBankProfile.findOne({ user_id: req.user.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ ...profile.toObject(), id: String(profile._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { bank_name, address, phone, city } = req.body;
    const profile = await BloodBankProfile.findOneAndUpdate(
      { user_id: req.user.userId },
      { bank_name, address, phone, city },
      { new: true, upsert: true }
    );
    res.json({ ...profile.toObject(), id: String(profile._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
