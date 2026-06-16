const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const DonorProfile = require('../models/DonorProfile');

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ user_id: req.user.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ ...profile.toObject(), id: String(profile._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { full_name, blood_group, address, phone, city } = req.body;
    const profile = await DonorProfile.findOneAndUpdate(
      { user_id: req.user.userId },
      { full_name, blood_group, address, phone, city },
      { new: true, upsert: true }
    );
    res.json({ ...profile.toObject(), id: String(profile._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
