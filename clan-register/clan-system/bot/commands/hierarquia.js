const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'hierarquia',
  description: 'Mostra a hierarquia do clã',
  async execute(message, args, client) {
    const db = client.db;
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get();
    const ranks = db.prepare('SELECT * FROM hierarchy ORDER BY position ASC').all();

    if (ranks.length === 0) {
      return message.reply('❌ Nenhuma hierarquia configurada. Use `/config`.');
    }

    const lines = ranks.map((r, i) => {
      const arrow = i < ranks.length - 1 ? '\n↓' : '';
      return `${r.emoji || '•'} **${r.name}**${arrow}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`${config.emoji || '🏆'} HIERARQUIA — ${config.clan_name || 'CLÃ'}`)
      .setDescription(lines.join('\n'))
      .setColor(config.primary_color || '#7C3AED')
      .setFooter({ text: config.footer_text || 'Sistema de Clã' })
      .setTimestamp();

    if (config.logo_url) embed.setThumbnail(config.logo_url);

    await message.reply({ embeds: [embed] });
  }
};
