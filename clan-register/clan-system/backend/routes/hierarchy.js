const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const ranks = db.prepare('SELECT * FROM hierarchy ORDER BY position ASC').all();
  res.json(ranks);
});

router.post('/', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const { name, emoji, role_id, position, can_approve, can_set, can_remove_set, can_view_logs, can_manage_members, can_config, who_can_give, who_can_remove, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
  const result = db.prepare(`
    INSERT INTO hierarchy (name, emoji, role_id, position, can_approve, can_set, can_remove_set, can_view_logs, can_manage_members, can_config, who_can_give, who_can_remove, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, emoji || '', role_id || '', position || 0,
    can_approve ? 1 : 0, can_set ? 1 : 0, can_remove_set ? 1 : 0,
    can_view_logs ? 1 : 0, can_manage_members ? 1 : 0, can_config ? 1 : 0,
    JSON.stringify(who_can_give || []), JSON.stringify(who_can_remove || []), color || '#FFFFFF'
  );
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const fields = ['name', 'emoji', 'role_id', 'position', 'can_approve', 'can_set', 'can_remove_set', 'can_view_logs', 'can_manage_members', 'can_config', 'who_can_give', 'who_can_remove', 'color'];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      let val = req.body[f];
      if (['who_can_give', 'who_can_remove'].includes(f) && typeof val !== 'string') val = JSON.stringify(val);
      if (['can_approve', 'can_set', 'can_remove_set', 'can_view_logs', 'can_manage_members', 'can_config'].includes(f)) val = val ? 1 : 0;
      values.push(val);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });
  values.push(req.params.id);
  db.prepare(`UPDATE hierarchy SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM hierarchy WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
