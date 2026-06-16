const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  donor_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drive_name:       { type: String, required: true },
  location:         String,
  appointment_date: { type: Date, required: true },
  status:           { type: String, enum: ['scheduled','completed','cancelled'], default: 'scheduled' },
}, { timestamps: true });

module.exports = mongoose.model('DonationAppointment', schema);
