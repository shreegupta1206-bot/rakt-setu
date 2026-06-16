const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  blood_bank_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blood_group:   { type: String, required: true, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  units:         { type: Number, required: true, default: 0, min: 0 },
}, { timestamps: true });

schema.index({ blood_bank_id: 1, blood_group: 1 }, { unique: true });

module.exports = mongoose.model('BloodInventory', schema);
