const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', status = 'active', hierarchy_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let where = "WHERE 1=1";
  const params = [];
  if (status) { where += " AND m.status = ?"; params.push(status); }
  if (search) { where += " AND (m.name LIKE ? OR m.discord_username LIKE ? OR m.fivem_id LIKE ? OR m.fivem_nick LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
  if (hierarchy_id) { where += " AND m.hierarchy_id = ?"; params.push(hierarchy_id); }

  const total = db.prepare(`SELECT COUNT(*) as c FROM members m ${where}`).get(...params).c;
  const members = db.prepare(`
    SELECT m.*, h.name as hierarchy_name, h.emoji as hierarchy_emoji
    FROM members m LEFT JOIN hierarchy h ON m.hierarchy_id = h.id
    ${where}
    ORDER BY h.position ASC, m.registered_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ members, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const member = db.prepare(`
    SELECT m.*, h.name as hierarchy_name, h.emoji as hierarchy_emoji
    FROM members m LEFT JOIN hierarchy h ON m.hierarchy_id = h.id
    WHERE m.discord_id = ? OR m.id = ?
  `).get(req.params.id, req.params.id);
  if (!member) return res.status(404).json({ error: 'Membro não encontrado' });

  const history = db.prepare(`
    SELECT sh.*, h1.name as from_name, h2.name as to_name
    FROM set_history sh
    LEFT JOIN hierarchy h1 ON sh.from_hierarchy_id = h1.id
    LEFT JOIN hierarchy h2 ON sh.to_hierarchy_id = h2.id
    WHERE sh.member_discord_id = ?
    ORDER BY sh.created_at DESC LIMIT 20
  `).all(member.discord_id);

  res.json({ ...member, history });
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const { name, fivem_id, fivem_nick, hierarchy_id, status, notes } = req.body;
  db.prepare(`
    UPDATE members SET name = COALESCE(?, name), fivem_id = COALESCE(?, fivem_id),
    fivem_nick = COALESCE(?, fivem_nick), hierarchy_id = COALESCE(?, hierarchy_id),
    status = COALESCE(?, status), notes = COALESCE(?, notes)
    WHERE discord_id = ? OR id = ?
  `).run(name, fivem_id, fivem_nick, hierarchy_id, status, notes, req.params.id, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM members WHERE discord_id = ? OR id = ?').run(req.params.id, req.params.id);
  res.json({ success: true });
});

module.exports = router;
