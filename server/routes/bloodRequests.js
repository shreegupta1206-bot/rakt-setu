const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const BloodRequest = require('../models/BloodRequest');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const query = role === 'hospital' ? { hospital_id: userId } : {};
    const requests = await BloodRequest.find(query).sort({ createdAt: -1 });
    res.json(requests.map(r => ({
      ...r.toObject(),
      id: String(r._id),
      created_at: r.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'hospital') return res.status(403).json({ error: 'Hospitals only' });
    const { blood_group, units, urgency, notes } = req.body;
    if (!blood_group || !units) return res.status(400).json({ error: 'blood_group and units required' });
    const request = await BloodRequest.create({
      hospital_id: req.user.userId,
      blood_group,
      units,
      urgency: urgency || 'urgent',
      notes,
    });
    res.status(201).json({ ...request.toObject(), id: String(request._id), created_at: request.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, committed_by, acknowledged_at } = req.body;
    const update = {};
    if (status) update.status = status;
    if (committed_by) update.committed_by = committed_by;
    if (acknowledged_at) update.acknowledged_at = new Date(acknowledged_at);

    const request = await BloodRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ ...request.toObject(), id: String(request._id), created_at: request.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
