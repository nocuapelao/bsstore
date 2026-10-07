const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const { type = '', page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let where = 'WHERE 1=1';
  const params = [];
  if (type) { where += ' AND type = ?'; params.push(type); }
  const total = db.prepare(`SELECT COUNT(*) as c FROM logs ${where}`).get(...params).c;
  const logs = db.prepare(`SELECT * FROM logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
  res.json({ logs, total, page: parseInt(page) });
});

module.exports = router;
