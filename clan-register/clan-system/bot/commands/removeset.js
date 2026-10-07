const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'removeset',
  description: 'Remove o set/cargo de um membro',
  async execute(message, args, client) {
    const db = client.db;
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Uso: `!removeset @usuário`');

    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    if (!isAdmin) {
      const executor = db.prepare('SELECT m.*, h.can_remove_set, h.position as pos FROM members m LEFT JOIN hierarchy h ON m.hierarchy_id = h.id WHERE m.discord_id = ?').get(message.author.id);
      if (!executor || !executor.can_remove_set) {
        return message.reply('❌ Você não tem permissão para remover sets.');
      }
    }

    const dbMember = db.prepare('SELECT m.*, h.name as hname, h.emoji as hemoji, h.role_id as hrole FROM members m LEFT JOIN hierarchy h ON m.hierarchy_id = h.id WHERE m.discord_id = ?').get(member.id);
    if (!dbMember || !dbMember.hierarchy_id) {
      return message.reply('❌ Este usuário não possui set no clã.');
    }

    // Remove role
    if (dbMember.hrole) {
      await member.roles.remove(dbMember.hrole).catch(() => {});
    }

    db.prepare('UPDATE members SET hierarchy_id = NULL WHERE discord_id = ?').run(member.id);

    db.prepare(`INSERT INTO set_history (member_discord_id, from_hierarchy_id, to_hierarchy_id, action, performed_by) VALUES (?, ?, NULL, 'remove', ?)`)
      .run(member.id, dbMember.hierarchy_id, message.author.id);

    db.prepare(`INSERT INTO logs (type, actor_id, target_id, description) VALUES ('remove_set', ?, ?, ?)`)
      .run(message.author.id, member.id, `Removeu set de ${member.user.username} (${dbMember.hname})`);

    if (config.logs_channel_id) {
      try {
        const logChannel = await client.channels.fetch(config.logs_channel_id);
        const embed = new EmbedBuilder()
          .setTitle('🗑️ SET REMOVIDO')
          .setColor('#EF4444')
          .addFields(
            { name: '👤 Membro', value: `<@${member.id}>`, inline: true },
            { name: '🗑️ Cargo removido', value: `${dbMember.hemoji || ''} ${dbMember.hname}`, inline: true },
            { name: '👮 Responsável', value: `<@${message.author.id}>`, inline: true },
            { name: '📅 Data', value: new Date().toLocaleString('pt-BR'), inline: true }
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      } catch {}
    }

    await message.reply(`✅ Set de ${member} (**${dbMember.hname}**) removido.`);
  }
};
