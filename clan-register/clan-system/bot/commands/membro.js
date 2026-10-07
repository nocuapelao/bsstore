const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'membro',
  description: 'Alias para !perfil',
  async execute(message, args, client) {
    // Reuse perfil
    const perfil = require('./perfil');
    return perfil.execute(message, args, client);
  }
};
