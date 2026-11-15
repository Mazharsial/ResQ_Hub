const router = require('express').Router(), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const { User } = require('./models');
const sign = (u) => jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ name: u.name, role: u.role, requestedRole: u.requestedRole });
exports.roleOf = (req) => {
  const h = req.get('authorization') || '';
  if (!h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), process.env.JWT_SECRET).role; } catch { return null; }
};
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const u = await User.create({ name, email, password: await bcrypt.hash(password, 10), requestedRole: ['volunteer', 'ngo'].includes(role) ? role : 'citizen' });
    res.status(201).json({ token: sign(u), user: pub(u) });
  } catch (e) { res.status(e.code === 11000 ? 409 : 400).json({ error: e.code === 11000 ? 'This email is already registered' : e.message }); }
});
router.post('/login', async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(401).json({ error: 'Email or password is incorrect' });
  res.json({ token: sign(u), user: pub(u) });
});
exports.router = router;
