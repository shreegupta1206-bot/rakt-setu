const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express  = require('express');
const cors     = require('cors');
const connectDB = require('./config/db');

const authRoutes        = require('./routes/auth');
const bloodBankRoutes   = require('./routes/bloodBank');
const hospitalRoutes    = require('./routes/hospital');
const donorRoutes       = require('./routes/donor');
const inventoryRoutes   = require('./routes/inventory');
const bloodReqRoutes    = require('./routes/bloodRequests');
const appointmentRoutes = require('./routes/appointments');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

app.use('/api/auth',           authRoutes);
app.use('/api/blood-bank',     bloodBankRoutes);
app.use('/api/hospital',       hospitalRoutes);
app.use('/api/donor',          donorRoutes);
app.use('/api/inventory',      inventoryRoutes);
app.use('/api/blood-requests', bloodReqRoutes);
app.use('/api/appointments',   appointmentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ HemoLink server running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    const isAtlas = (process.env.MONGODB_URI || '').includes('mongodb+srv');
    console.error('❌ MongoDB connection failed:', err.message);
    if (isAtlas) {
      console.error('👉 Atlas fix: go to cloud.mongodb.com → Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)');
    } else {
      console.error('👉 Make sure MongoDB is running locally or set MONGODB_URI in .env');
    }
    console.warn('⚠️  Starting server WITHOUT database — API calls will fail until DB is connected.');
    app.listen(PORT, () =>
      console.log(`⚠️  HemoLink running on http://localhost:${PORT} (no DB)`)
    );
  });
