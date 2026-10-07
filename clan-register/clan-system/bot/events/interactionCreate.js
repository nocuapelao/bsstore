const { 
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
  StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    const db = client.db;

    // ========== SLASH /config ==========
    if (interaction.isChatInputCommand() && interaction.commandName === 'config') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Apenas administradores podem usar este comando.', ephemeral: true });
      }
      return handleConfigMain(interaction, db);
    }

    // ========== BUTTONS ==========
    if (interaction.isButton()) {
      const customId = interaction.customId;

      // Registration button
      if (customId === 'register_start') {
        return handleRegisterStart(interaction, db);
      }

      // Approval buttons
      if (customId.startsWith('approve_')) {
        return handleApprove(interaction, db, client);
      }
      if (customId.startsWith('reject_')) {
        return handleRejectModal(interaction, db);
      }
      if (customId.startsWith('info_')) {
        return handleInfo(interaction, db);
      }

      // Config buttons
      if (customId.startsWith('cfg_')) {
        return handleConfigButtons(interaction, db, client);
      }
    }

    // ========== SELECT MENUS ==========
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('cfg_select_')) {
        return handleConfigSelects(interaction, db, client);
      }
    }

    // ========== MODALS ==========
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'register_modal') {
        return handleRegisterSubmit(interaction, db, client);
      }
      if (interaction.customId.startsWith('reject_modal_')) {
        return handleRejectSubmit(interaction, db, client);
      }
      if (interaction.customId.startsWith('cfg_modal_')) {
        return handleConfigModal(interaction, db, client);
      }
    }
  }
};

// ==================== CONFIG SYSTEM ====================
async function handleConfigMain(interaction, db) {
  const config = db.prepare('SELECT * FROM config WHERE id = 1').get();
  
  const embed = new EmbedBuilder()
    .setTitle(`${config.emoji || '🏆'} Configuração do Clã — ${config.clan_name}`)
    .setDescription('Selecione uma categoria para configurar o sistema.')
    .setColor(config.primary_color || '#7C3AED')
    .addFields(
      { name: '📛 Nome', value: config.clan_name || 'Não definido', inline: true },
      { name: '🎨 Cor', value: config.primary_color || '#7C3AED', inline: true },
      { name: '📢 Canais', value: 'Configuráveis', inline: true }
    )
    .setFooter({ text: config.footer_text || 'Sistema de Clã' })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('cfg_geral').setLabel('Geral').setEmoji('⚙️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('cfg_canais').setLabel('Canais').setEmoji('📢').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('cfg_hierarquia').setLabel('Hierarquia').setEmoji('👑').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('cfg_perguntas').setLabel('Perguntas').setEmoji('❓').setStyle(ButtonStyle.Primary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('cfg_mensagens').setLabel('Mensagens').setEmoji('💬').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('cfg_aprovacao').setLabel('Aprovação').setEmoji('✅').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('cfg_visual').setLabel('Visual').setEmoji('🎨').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('cfg_reload').setLabel('Recarregar').setEmoji('🔄').setStyle(ButtonStyle.Success)
  );

  await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
}

async function handleConfigButtons(interaction, db, client) {
  const id = interaction.customId;
  const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

  if (id === 'cfg_geral') {
    const modal = new ModalBuilder().setCustomId('cfg_modal_geral').setTitle('Configuração Geral');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('clan_name').setLabel('Nome do Clã').setStyle(TextInputStyle.Short).setValue(config.clan_name || '').setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('emoji').setLabel('Emoji do Clã').setStyle(TextInputStyle.Short).setValue(config.emoji || '🏆').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('primary_color').setLabel('Cor Principal (HEX)').setStyle(TextInputStyle.Short).setValue(config.primary_color || '#7C3AED').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('secondary_color').setLabel('Cor Secundária (HEX)').setStyle(TextInputStyle.Short).setValue(config.secondary_color || '#1E1B4B').setRequired(false)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === 'cfg_canais') {
    const modal = new ModalBuilder().setCustomId('cfg_modal_canais').setTitle('Configuração de Canais');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('panel_channel_id').setLabel('ID Canal do Painel').setStyle(TextInputStyle.Short).setValue(config.panel_channel_id || '').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('register_channel_id').setLabel('ID Canal de Registros').setStyle(TextInputStyle.Short).setValue(config.register_channel_id || '').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('logs_channel_id').setLabel('ID Canal de Logs').setStyle(TextInputStyle.Short).setValue(config.logs_channel_id || '').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('approval_channel_id').setLabel('ID Canal de Aprovação').setStyle(TextInputStyle.Short).setValue(config.approval_channel_id || '').setRequired(false)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === 'cfg_mensagens') {
    const modal = new ModalBuilder().setCustomId('cfg_modal_mensagens').setTitle('Mensagens do Painel');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('panel_title').setLabel('Título do Painel').setStyle(TextInputStyle.Short).setValue(config.panel_title || 'REGISTRO DO CLÃ').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('panel_description').setLabel('Descrição do Painel').setStyle(TextInputStyle.Paragraph).setValue(config.panel_description || '').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('welcome_message').setLabel('Mensagem de Boas-vindas').setStyle(TextInputStyle.Paragraph).setValue(config.welcome_message || '').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('register_button_label').setLabel('Texto do Botão').setStyle(TextInputStyle.Short).setValue(config.register_button_label || '📝 Fazer Registro').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('footer_text').setLabel('Footer').setStyle(TextInputStyle.Short).setValue(config.footer_text || '').setRequired(false)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === 'cfg_visual') {
    const modal = new ModalBuilder().setCustomId('cfg_modal_visual').setTitle('Visual / Imagens');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('logo_url').setLabel('URL da Logo').setStyle(TextInputStyle.Short).setValue(config.logo_url || '').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('banner_url').setLabel('URL do Banner').setStyle(TextInputStyle.Short).setValue(config.banner_url || '').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('thumbnail_url').setLabel('URL da Thumbnail').setStyle(TextInputStyle.Short).setValue(config.thumbnail_url || '').setRequired(false)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === 'cfg_aprovacao') {
    const enabled = config.approval_enabled ? 'Sim' : 'Não';
    const embed = new EmbedBuilder()
      .setTitle('✅ Sistema de Aprovação')
      .setDescription(`Status atual: **${enabled}**\n\nUse os botões abaixo para alterar.`)
      .setColor(config.primary_color || '#7C3AED');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('cfg_aprovacao_on').setLabel('Ativar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cfg_aprovacao_off').setLabel('Desativar').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('cfg_back').setLabel('Voltar').setStyle(ButtonStyle.Secondary)
    );
    return interaction.update({ embeds: [embed], components: [row] });
  }

  if (id === 'cfg_aprovacao_on' || id === 'cfg_aprovacao_off') {
    const val = id === 'cfg_aprovacao_on' ? 1 : 0;
    db.prepare('UPDATE config SET approval_enabled = ?, updated_at = datetime("now") WHERE id = 1').run(val);
    return interaction.update({ content: `✅ Aprovação ${val ? 'ativada' : 'desativada'}!`, embeds: [], components: [] });
  }

  if (id === 'cfg_hierarquia') {
    const ranks = db.prepare('SELECT * FROM hierarchy ORDER BY position ASC').all();
    let desc = ranks.map(r => `${r.emoji} **${r.name}** (pos: ${r.position})`).join('\n') || 'Nenhuma hierarquia configurada.';
    const embed = new EmbedBuilder()
      .setTitle('👑 Hierarquia Atual')
      .setDescription(desc)
      .setColor(config.primary_color || '#7C3AED')
      .setFooter({ text: 'Use o painel web para editar a hierarquia completa ou adicione via botões.' });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('cfg_hierarquia_add').setLabel('Adicionar').setEmoji('➕').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cfg_back').setLabel('Voltar').setStyle(ButtonStyle.Secondary)
    );
    return interaction.update({ embeds: [embed], components: [row] });
  }

  if (id === 'cfg_hierarquia_add') {
    const modal = new ModalBuilder().setCustomId('cfg_modal_hierarquia_add').setTitle('Adicionar Cargo na Hierarquia');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('name').setLabel('Nome do Cargo').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('emoji').setLabel('Emoji').setStyle(TextInputStyle.Short).setValue('🔰').setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('role_id').setLabel('ID do Cargo Discord').setStyle(TextInputStyle.Short).setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('position').setLabel('Posição (0 = topo)').setStyle(TextInputStyle.Short).setValue('10').setRequired(true)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === 'cfg_perguntas') {
    const questions = db.prepare('SELECT * FROM questions ORDER BY position ASC').all();
    let desc = questions.map((q, i) => `${i + 1}. **${q.label}** (\`${q.field_key}\`) ${q.required ? '🔴' : '⚪'}`).join('\n') || 'Nenhuma pergunta.';
    const embed = new EmbedBuilder()
      .setTitle('❓ Perguntas do Registro')
      .setDescription(desc + '\n\n🔴 = obrigatória')
      .setColor(config.primary_color || '#7C3AED');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('cfg_perguntas_add').setLabel('Adicionar').setEmoji('➕').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cfg_back').setLabel('Voltar').setStyle(ButtonStyle.Secondary)
    );
    return interaction.update({ embeds: [embed], components: [row] });
  }

  if (id === 'cfg_perguntas_add') {
    const modal = new ModalBuilder().setCustomId('cfg_modal_perguntas_add').setTitle('Adicionar Pergunta');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('label').setLabel('Label (ex: 👤 Nome)').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('field_key').setLabel('Chave (ex: name)').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('placeholder').setLabel('Placeholder').setStyle(TextInputStyle.Short).setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('required').setLabel('Obrigatória? (sim/nao)').setStyle(TextInputStyle.Short).setValue('sim').setRequired(true)
      )
    );
    return interaction.showModal(modal);
  }

  if (id === 'cfg_back' || id === 'cfg_reload') {
    return handleConfigMain(interaction, db);
  }
}

async function handleConfigModal(interaction, db, client) {
  const id = interaction.customId;
  const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

  if (id === 'cfg_modal_geral') {
    const clan_name = interaction.fields.getTextInputValue('clan_name');
    const emoji = interaction.fields.getTextInputValue('emoji') || '🏆';
    const primary_color = interaction.fields.getTextInputValue('primary_color') || '#7C3AED';
    const secondary_color = interaction.fields.getTextInputValue('secondary_color') || '#1E1B4B';
    db.prepare(`UPDATE config SET clan_name=?, emoji=?, primary_color=?, secondary_color=?, updated_at=datetime('now') WHERE id=1`)
      .run(clan_name, emoji, primary_color, secondary_color);
    logAction(db, 'config', interaction.user.id, null, `Atualizou configurações gerais: ${clan_name}`);
    return interaction.reply({ content: '✅ Configurações gerais salvas!', ephemeral: true });
  }

  if (id === 'cfg_modal_canais') {
    const panel = interaction.fields.getTextInputValue('panel_channel_id') || '';
    const register = interaction.fields.getTextInputValue('register_channel_id') || '';
    const logs = interaction.fields.getTextInputValue('logs_channel_id') || '';
    const approval = interaction.fields.getTextInputValue('approval_channel_id') || '';
    db.prepare(`UPDATE config SET panel_channel_id=?, register_channel_id=?, logs_channel_id=?, approval_channel_id=?, updated_at=datetime('now') WHERE id=1`)
      .run(panel, register, logs, approval);
    logAction(db, 'config', interaction.user.id, null, 'Atualizou canais');
    return interaction.reply({ content: '✅ Canais salvos!', ephemeral: true });
  }

  if (id === 'cfg_modal_mensagens') {
    const panel_title = interaction.fields.getTextInputValue('panel_title') || 'REGISTRO DO CLÃ';
    const panel_description = interaction.fields.getTextInputValue('panel_description') || '';
    const welcome_message = interaction.fields.getTextInputValue('welcome_message') || '';
    const register_button_label = interaction.fields.getTextInputValue('register_button_label') || '📝 Fazer Registro';
    const footer_text = interaction.fields.getTextInputValue('footer_text') || '';
    db.prepare(`UPDATE config SET panel_title=?, panel_description=?, welcome_message=?, register_button_label=?, footer_text=?, updated_at=datetime('now') WHERE id=1`)
      .run(panel_title, panel_description, welcome_message, register_button_label, footer_text);
    logAction(db, 'config', interaction.user.id, null, 'Atualizou mensagens');
    return interaction.reply({ content: '✅ Mensagens salvas!', ephemeral: true });
  }

  if (id === 'cfg_modal_visual') {
    const logo_url = interaction.fields.getTextInputValue('logo_url') || '';
    const banner_url = interaction.fields.getTextInputValue('banner_url') || '';
    const thumbnail_url = interaction.fields.getTextInputValue('thumbnail_url') || '';
    db.prepare(`UPDATE config SET logo_url=?, banner_url=?, thumbnail_url=?, updated_at=datetime('now') WHERE id=1`)
      .run(logo_url, banner_url, thumbnail_url);
    logAction(db, 'config', interaction.user.id, null, 'Atualizou visual');
    return interaction.reply({ content: '✅ Visual salvo!', ephemeral: true });
  }

  if (id === 'cfg_modal_hierarquia_add') {
    const name = interaction.fields.getTextInputValue('name');
    const emoji = interaction.fields.getTextInputValue('emoji') || '🔰';
    const role_id = interaction.fields.getTextInputValue('role_id') || '';
    const position = parseInt(interaction.fields.getTextInputValue('position') || '10');
    db.prepare(`INSERT INTO hierarchy (name, emoji, role_id, position) VALUES (?, ?, ?, ?)`)
      .run(name, emoji, role_id, position);
    logAction(db, 'config', interaction.user.id, null, `Adicionou hierarquia: ${name}`);
    return interaction.reply({ content: `✅ Cargo **${emoji} ${name}** adicionado à hierarquia!`, ephemeral: true });
  }

  if (id === 'cfg_modal_perguntas_add') {
    const label = interaction.fields.getTextInputValue('label');
    const field_key = interaction.fields.getTextInputValue('field_key').toLowerCase().replace(/\s+/g, '_');
    const placeholder = interaction.fields.getTextInputValue('placeholder') || '';
    const required = (interaction.fields.getTextInputValue('required') || 'sim').toLowerCase().startsWith('s') ? 1 : 0;
    const maxPos = db.prepare('SELECT MAX(position) as m FROM questions').get()?.m || 0;
    db.prepare(`INSERT INTO questions (label, field_key, placeholder, required, position) VALUES (?, ?, ?, ?, ?)`)
      .run(label, field_key, placeholder, required, maxPos + 1);
    logAction(db, 'config', interaction.user.id, null, `Adicionou pergunta: ${label}`);
    return interaction.reply({ content: `✅ Pergunta **${label}** adicionada!`, ephemeral: true });
  }
}

// ==================== REGISTER SYSTEM ====================
async function handleRegisterStart(interaction, db) {
  const questions = db.prepare('SELECT * FROM questions ORDER BY position ASC LIMIT 5').all();
  if (questions.length === 0) {
    return interaction.reply({ content: '❌ Nenhuma pergunta configurada. Use /config', ephemeral: true });
  }

  // Check if already registered
  const existing = db.prepare('SELECT id FROM members WHERE discord_id = ?').get(interaction.user.id);
  if (existing) {
    return interaction.reply({ content: '❌ Você já está registrado no clã!', ephemeral: true });
  }

  const pending = db.prepare("SELECT id FROM registrations WHERE discord_id = ? AND status = 'pending'").get(interaction.user.id);
  if (pending) {
    return interaction.reply({ content: '⏳ Você já tem um registro pendente de aprovação.', ephemeral: true });
  }

  const modal = new ModalBuilder().setCustomId('register_modal').setTitle('Registro no Clã');
  for (const q of questions.slice(0, 5)) {
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(q.field_key)
          .setLabel(q.label.substring(0, 45))
          .setPlaceholder(q.placeholder || '')
          .setStyle(TextInputStyle.Short)
          .setRequired(!!q.required)
          .setMaxLength(q.max_length || 100)
      )
    );
  }
  await interaction.showModal(modal);
}

async function handleRegisterSubmit(interaction, db, client) {
  const questions = db.prepare('SELECT * FROM questions ORDER BY position ASC LIMIT 5').all();
  const answers = {};
  for (const q of questions) {
    try {
      answers[q.field_key] = interaction.fields.getTextInputValue(q.field_key) || '';
    } catch {
      answers[q.field_key] = '';
    }
  }

  const config = db.prepare('SELECT * FROM config WHERE id = 1').get();
  const insert = db.prepare(`
    INSERT INTO registrations (discord_id, discord_username, answers, status)
    VALUES (?, ?, ?, 'pending')
  `);
  const result = insert.run(interaction.user.id, interaction.user.username, JSON.stringify(answers));
  const regId = result.lastInsertRowid;

  // Send to approval channel
  if (config.approval_channel_id) {
    try {
      const channel = await client.channels.fetch(config.approval_channel_id);
      if (channel) {
        const fields = Object.entries(answers).map(([k, v]) => {
          const q = questions.find(qq => qq.field_key === k);
          return { name: q?.label || k, value: v || '—', inline: true };
        });

        const embed = new EmbedBuilder()
          .setTitle('📋 NOVO REGISTRO')
          .setColor('#F59E0B')
          .setDescription(`👤 Usuário: <@${interaction.user.id}>\n🟡 Status: **AGUARDANDO**`)
          .addFields(fields)
          .setThumbnail(interaction.user.displayAvatarURL())
          .setFooter({ text: `ID: ${regId}` })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`approve_${regId}`).setLabel('APROVAR').setEmoji('✅').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`reject_${regId}`).setLabel('RECUSAR').setEmoji('❌').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(`info_${regId}`).setLabel('INFORMAÇÕES').setEmoji('🔎').setStyle(ButtonStyle.Secondary)
        );

        const msg = await channel.send({ embeds: [embed], components: [row] });
        db.prepare('UPDATE registrations SET message_id = ?, channel_id = ? WHERE id = ?').run(msg.id, channel.id, regId);
      }
    } catch (e) {
      console.error('Erro ao enviar para canal de aprovação:', e.message);
    }
  }

  logAction(db, 'registration', interaction.user.id, null, `Novo registro enviado`, { regId, answers });
  await interaction.reply({ content: '✅ Seu registro foi enviado e está aguardando aprovação!', ephemeral: true });
}

async function handleApprove(interaction, db, client) {
  const regId = interaction.customId.replace('approve_', '');
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(regId);
  if (!reg || reg.status !== 'pending') {
    return interaction.reply({ content: '❌ Registro não encontrado ou já processado.', ephemeral: true });
  }

  // Check permission (simplified - admin or hierarchy can_approve)
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    // Could check hierarchy here
  }

  const answers = JSON.parse(reg.answers || '{}');
  const config = db.prepare('SELECT * FROM config WHERE id = 1').get();

  // Find default member hierarchy (lowest or MEMBRO)
  let hierarchy = db.prepare("SELECT * FROM hierarchy WHERE name LIKE '%MEMBRO%' OR name LIKE '%RECRUTA%' ORDER BY position DESC LIMIT 1").get();
  if (!hierarchy) {
    hierarchy = db.prepare('SELECT * FROM hierarchy ORDER BY position DESC LIMIT 1').get();
  }

  // Insert member
  db.prepare(`
    INSERT OR REPLACE INTO members (discord_id, discord_username, name, fivem_id, fivem_nick, discord_tag, hierarchy_id, status, registered_by, approved_by, approved_at, extra_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, datetime('now'), ?)
  `).run(
    reg.discord_id,
    reg.discord_username,
    answers.name || answers.nome || '',
    answers.fivem_id || answers.id || '',
    answers.fivem_nick || answers.nick || '',
    answers.discord_tag || answers.discord || '',
    hierarchy?.id || null,
    reg.discord_id,
    interaction.user.id,
    JSON.stringify(answers)
  );

  db.prepare(`UPDATE registrations SET status = 'approved', reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?`)
    .run(interaction.user.id, regId);

  // Add role if configured
  if (hierarchy?.role_id) {
    try {
      const member = await interaction.guild.members.fetch(reg.discord_id);
      if (member) await member.roles.add(hierarchy.role_id).catch(() => {});
    } catch {}
  }
  if (config.member_role_id) {
    try {
      const member = await interaction.guild.members.fetch(reg.discord_id);
      if (member) await member.roles.add(config.member_role_id).catch(() => {});
    } catch {}
  }

  // Update embed
  const embed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor('#22C55E')
    .setDescription(`👤 Usuário: <@${reg.discord_id}>\n🟢 Status: **APROVADO**\n👮 Por: <@${interaction.user.id}>`);
  await interaction.message.edit({ embeds: [embed], components: [] });

  // DM user
  try {
    const user = await client.users.fetch(reg.discord_id);
    await user.send(`✅ Seu registro no clã **${config.clan_name}** foi **aprovado**!`);
  } catch {}

  logAction(db, 'approval', interaction.user.id, reg.discord_id, `Aprovou registro #${regId}`);
  await interaction.reply({ content: `✅ Registro de <@${reg.discord_id}> aprovado!`, ephemeral: true });
}

async function handleRejectModal(interaction, db) {
  const regId = interaction.customId.replace('reject_', '');
  const modal = new ModalBuilder().setCustomId(`reject_modal_${regId}`).setTitle('Motivo da Recusa');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('reason').setLabel('Motivo').setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder('Informe o motivo da recusa...')
    )
  );
  await interaction.showModal(modal);
}

async function handleRejectSubmit(interaction, db, client) {
  const regId = interaction.customId.replace('reject_modal_', '');
  const reason = interaction.fields.getTextInputValue('reason');
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(regId);
  if (!reg || reg.status !== 'pending') {
    return interaction.reply({ content: '❌ Registro não encontrado ou já processado.', ephemeral: true });
  }

  db.prepare(`UPDATE registrations SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now'), reason = ? WHERE id = ?`)
    .run(interaction.user.id, reason, regId);

  // Update original message if possible
  if (reg.message_id && reg.channel_id) {
    try {
      const channel = await client.channels.fetch(reg.channel_id);
      const msg = await channel.messages.fetch(reg.message_id);
      const embed = EmbedBuilder.from(msg.embeds[0])
        .setColor('#EF4444')
        .setDescription(`👤 Usuário: <@${reg.discord_id}>\n🔴 Status: **RECUSADO**\n👮 Por: <@${interaction.user.id}>\n📝 Motivo: ${reason}`);
      await msg.edit({ embeds: [embed], components: [] });
    } catch {}
  }

  const config = db.prepare('SELECT * FROM config WHERE id = 1').get();
  try {
    const user = await client.users.fetch(reg.discord_id);
    await user.send(`❌ Seu registro no clã **${config.clan_name}** foi **recusado**.\nMotivo: ${reason}`);
  } catch {}

  logAction(db, 'rejection', interaction.user.id, reg.discord_id, `Recusou registro #${regId}: ${reason}`);
  await interaction.reply({ content: `❌ Registro de <@${reg.discord_id}> recusado.`, ephemeral: true });
}

async function handleInfo(interaction, db) {
  const regId = interaction.customId.replace('info_', '');
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(regId);
  if (!reg) return interaction.reply({ content: '❌ Não encontrado.', ephemeral: true });
  const answers = JSON.parse(reg.answers || '{}');
  const embed = new EmbedBuilder()
    .setTitle(`🔎 Informações do Registro #${regId}`)
    .setColor('#3B82F6')
    .addFields(
      { name: 'Discord ID', value: reg.discord_id, inline: true },
      { name: 'Username', value: reg.discord_username, inline: true },
      { name: 'Status', value: reg.status, inline: true },
      { name: 'Criado em', value: reg.created_at, inline: true }
    );
  for (const [k, v] of Object.entries(answers)) {
    embed.addFields({ name: k, value: String(v) || '—', inline: true });
  }
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

function logAction(db, type, actorId, targetId, description, metadata = {}) {
  db.prepare(`INSERT INTO logs (type, actor_id, target_id, description, metadata) VALUES (?, ?, ?, ?, ?)`)
    .run(type, actorId || '', targetId || '', description, JSON.stringify(metadata));
}

async function handleConfigSelects(interaction, db, client) {
  // Placeholder for future selects
  await interaction.reply({ content: 'Seleção processada.', ephemeral: true });
}
