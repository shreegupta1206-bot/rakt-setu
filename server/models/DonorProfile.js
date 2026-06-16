const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  full_name:   { type: String, required: true },
  blood_group: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  address:     String,
  phone:       String,
  city:        String,
}, { timestamps: true });

module.exports = mongoose.model('DonorProfile', schema);
