const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'set',
  description: 'Define o cargo/hierarquia de um membro',
  async execute(message, args, client) {
    const db = client.db;
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

    if (args.length < 2) {
      return message.reply('❌ Uso: `!set @usuário NomeDoCargo`\nExemplo: `!set @João Membro`');
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Mencione um usuário válido.');

    const rankName = args.slice(1).join(' ').toUpperCase();
    const hierarchy = db.prepare('SELECT * FROM hierarchy WHERE UPPER(name) = ?').get(rankName);
    if (!hierarchy) {
      const all = db.prepare('SELECT name FROM hierarchy ORDER BY position').all().map(r => r.name).join(', ');
      return message.reply(`❌ Cargo não encontrado na hierarquia.\nDisponíveis: ${all}`);
    }

    // Permission check
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    if (!isAdmin) {
      // Check if executor has can_set and higher or equal position
      const executorMember = db.prepare('SELECT m.*, h.position as pos, h.can_set, h.name as hname FROM members m LEFT JOIN hierarchy h ON m.hierarchy_id = h.id WHERE m.discord_id = ?').get(message.author.id);
      if (!executorMember || !executorMember.can_set) {
        return message.reply('❌ Você não tem permissão para dar sets.');
      }
      if (executorMember.pos >= hierarchy.position) {
        return message.reply('❌ Você não pode dar um cargo igual ou superior ao seu.');
      }
    }

    // Get current member data
    let dbMember = db.prepare('SELECT * FROM members WHERE discord_id = ?').get(member.id);
    const fromHierarchyId = dbMember?.hierarchy_id || null;

    // Update or insert
    if (dbMember) {
      db.prepare('UPDATE members SET hierarchy_id = ? WHERE discord_id = ?').run(hierarchy.id, member.id);
    } else {
      db.prepare(`INSERT INTO members (discord_id, discord_username, hierarchy_id, status, registered_by) VALUES (?, ?, ?, 'active', ?)`)
        .run(member.id, member.user.username, hierarchy.id, message.author.id);
    }

    // Role management
    if (config.set_remove_previous && fromHierarchyId) {
      const oldH = db.prepare('SELECT role_id FROM hierarchy WHERE id = ?').get(fromHierarchyId);
      if (oldH?.role_id) {
        await member.roles.remove(oldH.role_id).catch(() => {});
      }
    }
    if (hierarchy.role_id) {
      await member.roles.add(hierarchy.role_id).catch(() => {});
    }

    // History
    db.prepare(`INSERT INTO set_history (member_discord_id, from_hierarchy_id, to_hierarchy_id, action, performed_by) VALUES (?, ?, ?, 'set', ?)`)
      .run(member.id, fromHierarchyId, hierarchy.id, message.author.id);

    // Log
    db.prepare(`INSERT INTO logs (type, actor_id, target_id, description) VALUES ('set', ?, ?, ?)`)
      .run(message.author.id, member.id, `Set: ${rankName} em ${member.user.username}`);

    // Send log channel
    if (config.logs_channel_id) {
      try {
        const logChannel = await client.channels.fetch(config.logs_channel_id);
        const embed = new EmbedBuilder()
          .setTitle('🎖️ SET REALIZADO')
          .setColor('#22C55E')
          .addFields(
            { name: '👤 Membro', value: `<@${member.id}>`, inline: true },
            { name: '🎖️ Cargo', value: `${hierarchy.emoji} ${hierarchy.name}`, inline: true },
            { name: '👮 Responsável', value: `<@${message.author.id}>`, inline: true }
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      } catch {}
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Set Realizado')
      .setDescription(`${member} agora é **${hierarchy.emoji} ${hierarchy.name}**`)
      .setColor(config.primary_color || '#7C3AED')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
