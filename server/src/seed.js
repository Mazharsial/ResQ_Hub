require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs'); const { Alert, Need, User, Ngo } = require('./models');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Alert, Need, User, Ngo].map((m) => m.deleteMany()));
  await User.create({ name: 'Admin', email: 'admin@resqhub.pk', password: await bcrypt.hash('Admin@12345', 10), role: 'admin', requestedRole: 'admin' });
  await Ngo.create([{ name: 'Pakistan Red Crescent', relief: 'Food & Medical' }, { name: 'Edhi Foundation', relief: 'Shelter & Medical' }, { name: 'Al-Khidmat Foundation', relief: 'Food & Shelter' }]);
  await Alert.create([
    { title: 'Flood Alert – River Ravi', city: 'Lahore', severity: 'danger', type: 'flood',
      message: 'Water in the River Ravi is rising. Residents of low-lying areas near the riverbank should move to higher ground in the next 3 hours.',
      simple: 'River water is rising. If you live near the river, go to a high place now.', urdu: 'دریائے راوی میں پانی بڑھ رہا ہے۔ دریا کے قریب رہنے والے فوراً اونچی جگہ پر چلے جائیں۔' },
    { title: 'Heavy flooding – Sialkot', city: 'Islamabad', severity: 'warning', type: 'flood', message: 'Heavy rain is expected for 24 hours. Avoid underpasses and nullahs.', simple: 'Heavy rain is coming. Stay away from water channels.', urdu: 'شدید بارش متوقع ہے۔ نالوں اور انڈر پاسز سے دور رہیں۔' }]);
  const d = (m) => new Date(2026, m, 10);
  await Need.create([
    { city: 'Lahore', area: 'Shahdara', families: 40, needs: ['food', 'water'], vulnerable: ['children', 'elderly'], status: 'verified', verifications: [{ role: 'volunteer' }, { role: 'ngo' }], createdAt: d(9) },
    { city: 'Lahore', area: 'Ravi Road', families: 15, needs: ['shelter', 'medical'], vulnerable: ['disability'], createdAt: d(10) },
    { city: 'Peshawar', area: 'Nowshera Road', type: 'landslide', families: 60, needs: ['food', 'medical'], vulnerable: ['women', 'children'], status: 'pledged', verifications: [{ role: 'volunteer' }, { role: 'ngo' }], pledges: [{ ngo: 'Edhi Foundation', items: '60 ration packs' }], createdAt: d(8) },
    { city: 'Karachi', area: 'Malir', families: 90, needs: ['water', 'shelter'], vulnerable: ['children'], status: 'delivered', verifications: [{ role: 'volunteer' }, { role: 'ngo' }], pledges: [{ ngo: 'Pakistan Red Crescent', items: 'Tents', delivered: true }], createdAt: d(6) },
    { city: 'Quetta', area: 'Sariab Road', type: 'earthquake', families: 25, needs: ['shelter', 'medical'], vulnerable: ['elderly'], createdAt: d(7) }]);
  console.log('Seeded. Admin: admin@resqhub.pk / Admin@12345 (change it!)'); process.exit(0);
})();
