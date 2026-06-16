const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  hospital_name:  { type: String, required: true },
  address:        String,
  phone:          String,
  city:           String,
}, { timestamps: true });

module.exports = mongoose.model('HospitalProfile', schema);
