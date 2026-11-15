const { Schema, model } = require('mongoose');
const Alert = model('Alert', new Schema({
  title: { type: String, required: true, maxlength: 120 },
  message: { type: String, required: true },   // full text
  simple: { type: String, required: true },    // simple language
  urdu: String,                                // Urdu text
  severity: { type: String, enum: ['info', 'warning', 'danger'], default: 'warning' },
  city: { type: String, required: true },
  type: { type: String, default: 'flood' },
}, { timestamps: true }));

const Need = model('Need', new Schema({
  city: { type: String, required: true },
  type: { type: String, enum: ['flood', 'earthquake', 'landslide'], default: 'flood' },
  description: { type: String, maxlength: 500 },
  area: { type: String, required: true, maxlength: 120 },
  families: { type: Number, min: 1, required: true },
  needs: [{ type: String, enum: ['food', 'water', 'shelter', 'medical'] }],
  vulnerable: [{ type: String, enum: ['children', 'women', 'elderly', 'disability'] }],
  contact: { type: String, maxlength: 60 },
  status: { type: String, enum: ['pending', 'verified', 'pledged', 'delivered'], default: 'pending' },
  verifications: [{ role: String, at: { type: Date, default: Date.now } }],
  pledges: [{ ngo: String, items: String, delivered: { type: Boolean, default: false } }],
  feedback: [{ rating: { type: Number, min: 1, max: 5 }, comment: String }],
}, { timestamps: true }));
const User = model('User', new Schema({
  name: { type: String, required: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'volunteer', 'ngo', 'admin'], default: 'citizen' },
  requestedRole: { type: String, default: 'citizen' }, // volunteer/ngo power needs admin approval
}, { timestamps: true }));
const Ngo = model('Ngo', new Schema({ name: String, relief: String, active: { type: Boolean, default: true } }));
module.exports = { Alert, Need, User, Ngo };
