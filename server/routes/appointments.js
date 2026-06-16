const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const DonationAppointment = require('../models/DonationAppointment');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const appointments = await DonationAppointment.find({ donor_id: req.user.userId }).sort({ appointment_date: -1 });
    res.json(appointments.map(a => ({
      ...a.toObject(),
      id: String(a._id),
      appointment_date: a.appointment_date,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'donor') return res.status(403).json({ error: 'Donors only' });
    const { drive_name, location, appointment_date } = req.body;
    if (!drive_name || !appointment_date) return res.status(400).json({ error: 'drive_name and appointment_date required' });
    const appointment = await DonationAppointment.create({
      donor_id: req.user.userId,
      drive_name,
      location,
      appointment_date: new Date(appointment_date),
    });
    res.status(201).json({ ...appointment.toObject(), id: String(appointment._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await DonationAppointment.findOneAndUpdate(
      { _id: req.params.id, donor_id: req.user.userId },
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ ...appointment.toObject(), id: String(appointment._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
