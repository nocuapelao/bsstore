const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function initDatabase(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Config table (singleton for clan settings)
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      clan_name TEXT DEFAULT 'Meu Clã',
      logo_url TEXT DEFAULT '',
      banner_url TEXT DEFAULT '',
      primary_color TEXT DEFAULT '#7C3AED',
      secondary_color TEXT DEFAULT '#1E1B4B',
      emoji TEXT DEFAULT '🏆',
      panel_channel_id TEXT DEFAULT '',
      register_channel_id TEXT DEFAULT '',
      logs_channel_id TEXT DEFAULT '',
      approval_channel_id TEXT DEFAULT '',
      member_role_id TEXT DEFAULT '',
      pending_role_id TEXT DEFAULT '',
      approval_enabled INTEGER DEFAULT 1,
      set_remove_previous INTEGER DEFAULT 1,
      welcome_message TEXT DEFAULT 'Seja bem-vindo ao nosso clã!',
      panel_title TEXT DEFAULT 'REGISTRO DO CLÃ',
      panel_description TEXT DEFAULT 'Para realizar seu registro, clique no botão abaixo.',
      register_button_label TEXT DEFAULT '📝 Fazer Registro',
      footer_text TEXT DEFAULT 'Sistema de Clã • FiveM',
      thumbnail_url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Insert default config if empty
  const configCount = db.prepare('SELECT COUNT(*) as c FROM config').get();
  if (configCount.c === 0) {
    db.prepare('INSERT INTO config (id) VALUES (1)').run();
  }

  // Hierarchy roles
  db.exec(`
    CREATE TABLE IF NOT EXISTS hierarchy (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT DEFAULT '',
      role_id TEXT DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      can_approve INTEGER DEFAULT 0,
      can_set INTEGER DEFAULT 0,
      can_remove_set INTEGER DEFAULT 0,
      can_view_logs INTEGER DEFAULT 0,
      can_manage_members INTEGER DEFAULT 0,
      can_config INTEGER DEFAULT 0,
      who_can_give TEXT DEFAULT '[]',
      who_can_remove TEXT DEFAULT '[]',
      color TEXT DEFAULT '#FFFFFF',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Registration questions
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      placeholder TEXT DEFAULT '',
      field_key TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      required INTEGER DEFAULT 1,
      min_length INTEGER DEFAULT 0,
      max_length INTEGER DEFAULT 100,
      position INTEGER DEFAULT 0,
      options TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Default questions if empty
  const qCount = db.prepare('SELECT COUNT(*) as c FROM questions').get();
  if (qCount.c === 0) {
    const insertQ = db.prepare(`
      INSERT INTO questions (label, placeholder, field_key, type, required, position)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertQ.run('👤 Nome', 'Seu nome completo', 'name', 'text', 1, 0);
    insertQ.run('🎮 ID', 'Seu ID no servidor', 'fivem_id', 'text', 1, 1);
    insertQ.run('🔰 Nick no FiveM', 'Seu nick no FiveM', 'fivem_nick', 'text', 1, 2);
    insertQ.run('📱 Discord', 'Seu Discord (ex: user#0000)', 'discord_tag', 'text', 0, 3);
  }

  // Members
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT UNIQUE NOT NULL,
      discord_username TEXT DEFAULT '',
      discord_tag TEXT DEFAULT '',
      name TEXT DEFAULT '',
      fivem_id TEXT DEFAULT '',
      fivem_nick TEXT DEFAULT '',
      hierarchy_id INTEGER,
      status TEXT DEFAULT 'active',
      registered_by TEXT DEFAULT '',
      registered_at TEXT DEFAULT (datetime('now')),
      approved_by TEXT DEFAULT '',
      approved_at TEXT,
      extra_data TEXT DEFAULT '{}',
      notes TEXT DEFAULT '',
      FOREIGN KEY (hierarchy_id) REFERENCES hierarchy(id) ON DELETE SET NULL
    );
  `);

  // Registrations (pending)
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      discord_username TEXT DEFAULT '',
      answers TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      message_id TEXT DEFAULT '',
      channel_id TEXT DEFAULT '',
      reviewed_by TEXT DEFAULT '',
      reviewed_at TEXT,
      reason TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Set history
  db.exec(`
    CREATE TABLE IF NOT EXISTS set_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_discord_id TEXT NOT NULL,
      from_hierarchy_id INTEGER,
      to_hierarchy_id INTEGER,
      action TEXT DEFAULT 'set',
      performed_by TEXT NOT NULL,
      reason TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      actor_id TEXT DEFAULT '',
      target_id TEXT DEFAULT '',
      description TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Default hierarchy if empty
  const hCount = db.prepare('SELECT COUNT(*) as c FROM hierarchy').get();
  if (hCount.c === 0) {
    const insertH = db.prepare(`
      INSERT INTO hierarchy (name, emoji, position, can_approve, can_set, can_remove_set, can_view_logs, can_manage_members, can_config, who_can_give, who_can_remove)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertH.run('DONO', '👑', 0, 1, 1, 1, 1, 1, 1, '[]', '[]');
    insertH.run('GERENTE', '💎', 1, 1, 1, 1, 1, 1, 0, '["DONO"]', '["DONO"]');
    insertH.run('COORDENADOR', '⚡', 2, 1, 1, 1, 1, 1, 0, '["DONO","GERENTE"]', '["DONO","GERENTE"]');
    insertH.run('STAFF', '🛡️', 3, 1, 1, 1, 1, 0, 0, '["DONO","GERENTE","COORDENADOR"]', '["DONO","GERENTE","COORDENADOR"]');
    insertH.run('RESPONSÁVEL', '🔰', 4, 0, 1, 0, 0, 0, 0, '["DONO","GERENTE","COORDENADOR","STAFF"]', '["DONO","GERENTE","COORDENADOR","STAFF"]');
    insertH.run('MEMBRO', '🎯', 5, 0, 0, 0, 0, 0, 0, '["DONO","GERENTE","COORDENADOR","STAFF","RESPONSÁVEL"]', '["DONO","GERENTE","COORDENADOR","STAFF"]');
    insertH.run('RECRUTA', '🔰', 6, 0, 0, 0, 0, 0, 0, '["DONO","GERENTE","COORDENADOR","STAFF","RESPONSÁVEL"]', '["DONO","GERENTE","COORDENADOR","STAFF"]');
  }

  return db;
}

module.exports = { initDatabase };
