const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'perfil',
  description: 'Mostra o perfil de um membro do clã',
  async execute(message, args, client) {
    const db = client.db;
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

    let targetId = message.author.id;
    if (message.mentions.users.first()) {
      targetId = message.mentions.users.first().id;
    } else if (args[0] && /^\d+$/.test(args[0])) {
      targetId = args[0];
    }

    const member = db.prepare(`
      SELECT m.*, h.name as hname, h.emoji as hemoji 
      FROM members m 
      LEFT JOIN hierarchy h ON m.hierarchy_id = h.id 
      WHERE m.discord_id = ?
    `).get(targetId);

    if (!member) {
      return message.reply('❌ Este usuário não está registrado no clã.');
    }

    const history = db.prepare(`
      SELECT sh.*, h1.name as from_name, h2.name as to_name, h1.emoji as from_emoji, h2.emoji as to_emoji
      FROM set_history sh
      LEFT JOIN hierarchy h1 ON sh.from_hierarchy_id = h1.id
      LEFT JOIN hierarchy h2 ON sh.to_hierarchy_id = h2.id
      WHERE sh.member_discord_id = ?
      ORDER BY sh.created_at DESC
      LIMIT 10
    `).all(targetId);

    const histLines = history.map(h => {
      if (h.action === 'remove') return `• ${h.from_emoji || ''} ${h.from_name || '?'} → *Removido*`;
      return `• ${h.from_emoji || ''} ${h.from_name || 'Nenhum'} → ${h.to_emoji || ''} ${h.to_name || '?'}`;
    });

    const embed = new EmbedBuilder()
      .setTitle('👤 PERFIL DO MEMBRO')
      .setColor(config.primary_color || '#7C3AED')
      .addFields(
        { name: 'Usuário', value: `<@${member.discord_id}>`, inline: true },
        { name: 'ID FiveM', value: member.fivem_id || '—', inline: true },
        { name: 'Nick', value: member.fivem_nick || member.name || '—', inline: true },
        { name: 'Cargo', value: `${member.hemoji || ''} ${member.hname || 'Sem cargo'}`, inline: true },
        { name: 'Status', value: member.status === 'active' ? '🟢 Ativo' : member.status, inline: true },
        { name: '📅 Registrado em', value: member.registered_at || '—', inline: true }
      )
      .setThumbnail(`https://cdn.discordapp.com/avatars/${member.discord_id}/default.png`)
      .setFooter({ text: config.footer_text || 'Sistema de Clã' })
      .setTimestamp();

    if (member.approved_by) {
      embed.addFields({ name: '👮 Aprovado por', value: `<@${member.approved_by}>`, inline: true });
    }

    if (histLines.length > 0) {
      embed.addFields({ name: '📋 Histórico de Sets', value: histLines.join('\n') || 'Nenhum' });
    }

    await message.reply({ embeds: [embed] });
  }
};
