const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'logs',
  description: 'Consulta os últimos logs do sistema',
  async execute(message, args, client) {
    const db = client.db;
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      const executor = db.prepare('SELECT h.can_view_logs FROM members m LEFT JOIN hierarchy h ON m.hierarchy_id = h.id WHERE m.discord_id = ?').get(message.author.id);
      if (!executor?.can_view_logs) {
        return message.reply('❌ Você não tem permissão para ver os logs.');
      }
    }

    const limit = Math.min(parseInt(args[0]) || 15, 25);
    const logs = db.prepare('SELECT * FROM logs ORDER BY created_at DESC LIMIT ?').all(limit);

    if (logs.length === 0) {
      return message.reply('📭 Nenhum log registrado ainda.');
    }

    const lines = logs.map(l => {
      const date = l.created_at?.substring(0, 16) || '';
      return `\`${date}\` **[${l.type}]** ${l.description}`;
    });

    const embed = new EmbedBuilder()
      .setTitle('📊 LOGS DO SISTEMA')
      .setDescription(lines.join('\n'))
      .setColor(config.primary_color || '#7C3AED')
      .setFooter({ text: `Últimos ${logs.length} registros` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
