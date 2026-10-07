const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'painel',
  description: 'Envia o painel de registro do clã',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && 
        !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Você não tem permissão para usar este comando.');
    }

    const db = client.db;
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

    const embed = new EmbedBuilder()
      .setTitle(`${config.emoji || '🏆'} ${config.clan_name || 'CLÃ'}`)
      .setDescription(`**${config.panel_title || 'REGISTRO DO CLÃ'}**\n\n${config.welcome_message || 'Seja bem-vindo ao nosso clã!'}\n\n${config.panel_description || 'Para realizar seu registro, clique no botão abaixo.'}`)
      .setColor(config.primary_color || '#7C3AED')
      .setFooter({ text: config.footer_text || 'Sistema de Clã • FiveM' })
      .setTimestamp();

    if (config.banner_url) embed.setImage(config.banner_url);
    if (config.logo_url) embed.setThumbnail(config.logo_url);
    else if (config.thumbnail_url) embed.setThumbnail(config.thumbnail_url);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('register_start')
        .setLabel(config.register_button_label || '📝 Fazer Registro')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
    if (message.deletable) message.delete().catch(() => {});
  }
};
