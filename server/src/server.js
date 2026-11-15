
// Load environment variables from resq-server/.env
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { Alert, Need, User, Ngo } = require('./models');

const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Validate environment variables
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is missing.');
  console.error('Please check your resq-server/.env file.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is missing from .env');
  process.exit(1);
}

// Middleware
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json({ limit: '50kb' }));

app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 120
}));

// Authentication
const auth = require('./auth');
const roleOf = auth.roleOf;

// Role-based authorization
const need = (...roles) => (req, res, next) => {
  const role = roleOf(req);

  if (!role || !roles.includes(role)) {
    return res.status(403).json({
      error: 'Not allowed for this key'
    });
  }

  req.role = role;
  next();
};

// Async error handler
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error('API Error:', error.message);

    if (!res.headersSent) {
      res.status(
        error.name === 'ValidationError' ? 400 : 500
      ).json({
        error: error.message
      });
    }
  }
};

// ===============================
// ALERT ROUTES
// ===============================

app.get('/api/alerts', wrap(async (req, res) => {
  const query = req.query.city
    ? { city: req.query.city }
    : {};

  const alerts = await Alert.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(alerts);
}));

app.post('/api/alerts',
  need('admin'),
  wrap(async (req, res) => {
    const alert = await Alert.create(req.body);

    res.status(201).json(alert);
  })
);

// ===============================
// NEED ROUTES
// ===============================

// Get all needs
app.get('/api/needs', wrap(async (req, res) => {
  const query = {};

  if (req.query.city) query.city = req.query.city;
  if (req.query.status) query.status = req.query.status;
  if (req.query.type) query.type = req.query.type;

  const needs = await Need.find(query)
    .select('-contact')
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(needs);
}));

// Create a need
app.post('/api/needs', wrap(async (req, res) => {
  const {
    city,
    type,
    description,
    area,
    families,
    needs,
    vulnerable,
    contact
  } = req.body;

  const newNeed = await Need.create({
    city,
    type,
    description,
    area,
    families,
    needs,
    vulnerable,
    contact
  });

  res.status(201).json(newNeed);
}));

// Verify a need
app.post('/api/needs/:id/verify',
  need('volunteer', 'ngo', 'admin'),
  wrap(async (req, res) => {
    const needItem = await Need.findById(req.params.id);

    if (!needItem) {
      return res.status(404).json({
        error: 'Need not found'
      });
    }

    if (!needItem.verifications.some(
      verification => verification.role === req.role
    )) {
      needItem.verifications.push({
        role: req.role
      });
    }

    if (
      needItem.status === 'pending' &&
      needItem.verifications.length >= 2
    ) {
      needItem.status = 'verified';
    }

    res.json(await needItem.save());
  })
);

// Pledge aid
app.post('/api/needs/:id/pledge',
  need('ngo', 'admin'),
  wrap(async (req, res) => {
    const needItem = await Need.findById(req.params.id);

    if (!needItem) {
      return res.status(404).json({
        error: 'Need not found'
      });
    }

    if (needItem.status === 'pending') {
      return res.status(409).json({
        error: 'Verify the need before pledging aid'
      });
    }

    needItem.pledges.push({
      ngo: req.body.ngo,
      items: req.body.items
    });

    if (needItem.status === 'verified') {
      needItem.status = 'pledged';
    }

    res.json(await needItem.save());
  })
);

// Mark aid as delivered
app.post('/api/needs/:id/deliver',
  need('ngo', 'admin'),
  wrap(async (req, res) => {
    const needItem = await Need.findById(req.params.id);

    if (!needItem) {
      return res.status(404).json({
        error: 'Need not found'
      });
    }

    needItem.pledges.forEach(pledge => {
      pledge.delivered = true;
    });

    needItem.status = 'delivered';

    res.json(await needItem.save());
  })
);

// Feedback
app.post('/api/needs/:id/feedback',
  wrap(async (req, res) => {
    const needItem = await Need.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          feedback: {
            rating: req.body.rating,
            comment: req.body.comment
          }
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!needItem) {
      return res.status(404).json({
        error: 'Need not found'
      });
    }

    res.json(needItem);
  })
);

// ===============================
// STATISTICS
// ===============================

app.get('/api/stats', wrap(async (req, res) => {
  const byStatus = await Need.aggregate([
    {
      $group: {
        _id: '$status',
        reports: { $sum: 1 },
        families: { $sum: '$families' }
      }
    }
  ]);

  res.json(byStatus);
}));

// ===============================
// AUTHENTICATION ROUTES
// ===============================

app.use('/api/auth', auth.router);

// ===============================
// NGO ROUTES
// ===============================

app.get('/api/ngos', wrap(async (req, res) => {
  const ngos = await Ngo.find();

  res.json(ngos);
}));

// ===============================
// OVERVIEW
// ===============================

app.get('/api/overview', wrap(async (req, res) => {
  const [
    alerts,
    families,
    delivered,
    volunteers
  ] = await Promise.all([
    Alert.countDocuments({
      severity: { $ne: 'info' }
    }),

    Need.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$families' }
        }
      }
    ]),

    Need.countDocuments({
      status: 'delivered'
    }),

    User.countDocuments({
      role: 'volunteer'
    })
  ]);

  res.json({
    alerts,
    families: families[0]?.total || 0,
    delivered,
    volunteers
  });
}));

// ===============================
// ADMIN SUMMARY
// ===============================

app.get('/api/admin/summary',
  need('admin'),
  wrap(async (req, res) => {
    const [
      users,
      alerts,
      needs,
      delivered,
      orgs,
      monthly,
      pending,
      recent
    ] = await Promise.all([
      User.countDocuments(),
      Alert.countDocuments(),
      Need.countDocuments(),

      Need.countDocuments({
        status: 'delivered'
      }),

      Ngo.countDocuments(),

      Need.aggregate([
        {
          $group: {
            _id: {
              $month: '$createdAt'
            },
            n: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),

      User.find({
        $expr: {
          $ne: ['$role', '$requestedRole']
        }
      }).select('name email requestedRole'),

      Need.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('area city status createdAt')
    ]);

    res.json({
      users,
      alerts,
      needs,
      resolved: needs
        ? Math.round((delivered / needs) * 100)
        : 0,
      orgs,
      monthly,
      pending,
      recent
    });
  })
);

// ===============================
// ADMIN APPROVE USERS
// ===============================

app.post('/api/admin/users/:id/approve',
  need('admin'),
  wrap(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    user.role = user.requestedRole;

    await user.save();

    res.json({
      ok: true,
      message: 'User approved successfully'
    });
  })
);

// ===============================
// HEALTH CHECK
// ===============================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ResQ Hub API is running',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// ===============================
// MONGODB CONNECTION
// ===============================

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGO_URI);

    console.log('MongoDB Connected Successfully');

    app.listen(PORT, () => {
      console.log(`ResQ Hub API running on port ${PORT}`);
      console.log(`Frontend: ${process.env.CLIENT_ORIGIN}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('MongoDB Connection Failed:');
    console.error(error.message);

    process.exit(1);
  }
}

startServer();
