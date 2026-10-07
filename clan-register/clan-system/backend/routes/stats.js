const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const members = db.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'active'").get().c;
  const totalRegs = db.prepare('SELECT COUNT(*) as c FROM registrations').get().c;
  const pending = db.prepare("SELECT COUNT(*) as c FROM registrations WHERE status = 'pending'").get().c;
  const sets = db.prepare("SELECT COUNT(*) as c FROM set_history WHERE action = 'set'").get().c;
  const removes = db.prepare("SELECT COUNT(*) as c FROM set_history WHERE action = 'remove'").get().c;

  const recentRegs = db.prepare(`
    SELECT id, discord_id, discord_username, status, created_at 
    FROM registrations ORDER BY created_at DESC LIMIT 5
  `).all();

  const recentSets = db.prepare(`
    SELECT sh.*, m.name as member_name, h.name as rank_name
    FROM set_history sh
    LEFT JOIN members m ON sh.member_discord_id = m.discord_id
    LEFT JOIN hierarchy h ON sh.to_hierarchy_id = h.id
    ORDER BY sh.created_at DESC LIMIT 5
  `).all();

  const byHierarchy = db.prepare(`
    SELECT h.name, h.emoji, COUNT(m.id) as count
    FROM hierarchy h
    LEFT JOIN members m ON m.hierarchy_id = h.id AND m.status = 'active'
    GROUP BY h.id
    ORDER BY h.position
  `).all();

  res.json({
    members,
    totalRegistrations: totalRegs,
    pending,
    sets,
    removes,
    recentRegistrations: recentRegs,
    recentSets,
    byHierarchy
  });
});

module.exports = router;
