require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client, GatewayIntentBits, Partials, Collection, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./utils/database');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../backend/database/clan.db');
const db = initDatabase(dbPath);
client.db = db;
client.commands = new Collection();
client.prefix = '!';

// Load prefix commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.name) {
      client.commands.set(command.name, command);
      console.log(`[CMD] Loaded: !${command.name}`);
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`[EVT] Loaded: ${event.name}`);
  }
}

// Register ONLY /config slash command
async function registerSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commands = [
    new SlashCommandBuilder()
      .setName('config')
      .setDescription('Abre o painel de configuração completa do bot do clã')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .toJSON()
  ];

  try {
    console.log('Registrando slash command /config...');
    if (process.env.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
        { body: commands }
      );
      console.log('Slash command registrado no servidor!');
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commands }
      );
      console.log('Slash command registrado globalmente!');
    }
  } catch (error) {
    console.error('Erro ao registrar slash commands:', error);
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  client.user.setActivity('!painel | /config', { type: 3 });
  await registerSlashCommands();
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Erro ao logar:', err.message);
  process.exit(1);
});

module.exports = { client, db };
