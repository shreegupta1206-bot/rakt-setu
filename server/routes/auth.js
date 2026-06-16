const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BloodBankProfile = require('../models/BloodBankProfile');
const HospitalProfile = require('../models/HospitalProfile');
const DonorProfile = require('../models/DonorProfile');
const BloodInventory = require('../models/BloodInventory');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, address, phone, blood_group, city } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password and role required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ email, password, role });

    if (role === 'blood_bank') {
      const profile = await BloodBankProfile.create({ user_id: user._id, bank_name: name || email, address, phone, city });
      await Promise.all(BLOOD_GROUPS.map(bg =>
        BloodInventory.create({ blood_bank_id: user._id, blood_group: bg, units: 0 })
      ));
      const token = jwt.sign({ userId: String(user._id), role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, role, userId: String(user._id), profile });
    }

    if (role === 'hospital') {
      const profile = await HospitalProfile.create({ user_id: user._id, hospital_name: name || email, address, phone, city });
      const token = jwt.sign({ userId: String(user._id), role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, role, userId: String(user._id), profile });
    }

    if (role === 'donor') {
      const profile = await DonorProfile.create({ user_id: user._id, full_name: name || email, blood_group, address, phone, city });
      const token = jwt.sign({ userId: String(user._id), role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, role, userId: String(user._id), profile });
    }

    res.status(400).json({ error: 'Invalid role' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (role && user.role !== role) return res.status(401).json({ error: `This account is not a ${role}` });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, userId: String(user._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
