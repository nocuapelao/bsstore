require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDatabase } = require('./database/schema');

const app = express();
const PORT = process.env.PORT || 3001;

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database/clan.db');
const db = initDatabase(dbPath);
app.locals.db = db;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/members', require('./routes/members'));
app.use('/api/hierarchy', require('./routes/hierarchy'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/questions', require('./routes/questions'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
