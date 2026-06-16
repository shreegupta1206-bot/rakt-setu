const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const HospitalProfile = require('../models/HospitalProfile');

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await HospitalProfile.findOne({ user_id: req.user.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ ...profile.toObject(), id: String(profile._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { hospital_name, address, phone, city } = req.body;
    const profile = await HospitalProfile.findOneAndUpdate(
      { user_id: req.user.userId },
      { hospital_name, address, phone, city },
      { new: true, upsert: true }
    );
    res.json({ ...profile.toObject(), id: String(profile._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
