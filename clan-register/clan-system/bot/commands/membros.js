const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'membros',
  description: 'Lista os membros registrados do clã',
  async execute(message, args, client) {
    const db = client.db;
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get();
    const page = parseInt(args[0]) || 1;
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const total = db.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'active'").get().c;
    const members = db.prepare(`
      SELECT m.*, h.name as hname, h.emoji as hemoji 
      FROM members m 
      LEFT JOIN hierarchy h ON m.hierarchy_id = h.id 
      WHERE m.status = 'active'
      ORDER BY h.position ASC, m.registered_at DESC
      LIMIT ? OFFSET ?
    `).all(perPage, offset);

    if (members.length === 0) {
      return message.reply('📭 Nenhum membro registrado ainda.');
    }

    const totalPages = Math.ceil(total / perPage) || 1;
    const lines = members.map((m, i) => {
      const num = offset + i + 1;
      return `\`${num}.\` ${m.hemoji || '•'} **${m.name || m.discord_username}** — ${m.hname || 'Sem cargo'} (<@${m.discord_id}>)`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`${config.emoji || '🏆'} MEMBROS — ${config.clan_name || 'CLÃ'}`)
      .setDescription(lines.join('\n'))
      .setColor(config.primary_color || '#7C3AED')
      .setFooter({ text: `Página ${page}/${totalPages} • Total: ${total} membros` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
