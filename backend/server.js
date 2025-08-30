require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./db');
const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/families');
const choreRoutes = require('./routes/chores');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/chores', choreRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Chore Manager API is running' });
});

// Sync DB and start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK.');
    // Use alter:true for dev convenience (keeps data, adds columns)
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
