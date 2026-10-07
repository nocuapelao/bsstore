const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const { status = '', page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND status = ?'; params.push(status); }
  const total = db.prepare(`SELECT COUNT(*) as c FROM registrations ${where}`).get(...params).c;
  const regs = db.prepare(`SELECT * FROM registrations ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
  res.json({ registrations: regs, total, page: parseInt(page) });
});

router.get('/:id', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  if (!reg) return res.status(404).json({ error: 'Não encontrado' });
  res.json(reg);
});

module.exports = router;
