const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const questions = db.prepare('SELECT * FROM questions ORDER BY position ASC').all();
  res.json(questions);
});

router.post('/', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const { label, field_key, placeholder, type, required, position, min_length, max_length } = req.body;
  if (!label || !field_key) return res.status(400).json({ error: 'label e field_key obrigatórios' });
  const maxPos = db.prepare('SELECT MAX(position) as m FROM questions').get()?.m || 0;
  const result = db.prepare(`
    INSERT INTO questions (label, field_key, placeholder, type, required, position, min_length, max_length)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(label, field_key, placeholder || '', type || 'text', required ? 1 : 0, position ?? maxPos + 1, min_length || 0, max_length || 100);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const fields = ['label', 'field_key', 'placeholder', 'type', 'required', 'position', 'min_length', 'max_length'];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(f === 'required' ? (req.body[f] ? 1 : 0) : req.body[f]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });
  values.push(req.params.id);
  db.prepare(`UPDATE questions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
