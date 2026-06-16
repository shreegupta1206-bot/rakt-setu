const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  hospital_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blood_group:    { type: String, required: true },
  units:          { type: Number, required: true, min: 1 },
  urgency:        { type: String, enum: ['critical','urgent','routine'], default: 'urgent' },
  status:         { type: String, enum: ['pending','committed','in_transit','delivered','cancelled'], default: 'pending' },
  notes:          String,
  committed_by:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledged_at: Date,
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', schema);
