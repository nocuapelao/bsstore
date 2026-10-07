const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const config = db.prepare('SELECT * FROM config WHERE id = 1').get();
  res.json(config || {});
});

router.put('/', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const allowed = [
    'clan_name', 'logo_url', 'banner_url', 'primary_color', 'secondary_color', 'emoji',
    'panel_channel_id', 'register_channel_id', 'logs_channel_id', 'approval_channel_id',
    'member_role_id', 'pending_role_id', 'approval_enabled', 'set_remove_previous',
    'welcome_message', 'panel_title', 'panel_description', 'register_button_label',
    'footer_text', 'thumbnail_url'
  ];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });
  updates.push("updated_at = datetime('now')");
  db.prepare(`UPDATE config SET ${updates.join(', ')} WHERE id = 1`).run(...values);
  const config = db.prepare('SELECT * FROM config WHERE id = 1').get();
  res.json(config);
});

module.exports = router;
