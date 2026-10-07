const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ajuda',
  aliases: ['help', 'comandos'],
  description: 'Lista os comandos disponíveis',
  async execute(message, args, client) {
    const db = client.db;
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

    const embed = new EmbedBuilder()
      .setTitle(`${config.emoji || '🏆'} Comandos — ${config.clan_name || 'Clã'}`)
      .setColor(config.primary_color || '#7C3AED')
      .setDescription('Lista de comandos do sistema de clã.')
      .addFields(
        { name: '📋 Registro', value: '`!painel` — Envia o painel de registro\n`!perfil [@user]` — Ver perfil\n`!membros [página]` — Listar membros', inline: false },
        { name: '🎖️ Sets', value: '`!set @user Cargo` — Dar set\n`!removeset @user` — Remover set\n`!hierarquia` — Ver hierarquia', inline: false },
        { name: '📊 Admin', value: '`!logs [qtd]` — Ver logs\n`/config` — Configurar o bot (Slash)', inline: false }
      )
      .setFooter({ text: 'Único Slash Command: /config | Todos os outros usam !' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
