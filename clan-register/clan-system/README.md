# 🏆 Clan Register System — FiveM Discord

Sistema completo de registro, set e gerenciamento de clãs para servidores FiveM/PvP no Discord.

Estilo: ZTK PVP, TryHard e comunidades semelhantes.

## ✨ Funcionalidades

- **Único Slash Command**: `/config` (tudo mais usa `!`)
- Painel de registro com botões e modals
- Sistema de aprovação/recusa com logs
- Hierarquia configurável com permissões
- Comandos: `!painel`, `!set`, `!removeset`, `!hierarquia`, `!membros`, `!perfil`, `!logs`, `!ajuda`
- Painel Web moderno (React + Tailwind) com Dashboard
- Banco SQLite (pronto para produção)
- Autenticação Discord OAuth no painel

## 📁 Estrutura

```
clan-system/
├── bot/           # Bot Discord.js
├── backend/       # API Express
├── frontend/      # React + Vite + Tailwind
├── .env.example
├── netlify.toml
└── README.md
```

## 🚀 Instalação Rápida

### 1. Clone / Extraia e configure

```bash
cd clan-system
cp .env.example .env
# Edite o .env com seus tokens e IDs
```

### 2. Instale dependências

```bash
npm run setup
# ou manualmente:
cd bot && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### 3. Configure o Discord Developer Portal

1. Crie uma aplicação em https://discord.com/developers/applications
2. Bot → Reset Token → copie para `DISCORD_TOKEN`
3. OAuth2 → Client ID e Client Secret
4. Redirect URI: `http://localhost:3001/api/auth/callback` (ou sua URL de produção)
5. Privileged Gateway Intents: **Message Content Intent** e **Server Members Intent**
6. Convide o bot com permissões: Administrator ou Manage Roles + Send Messages + etc.

### 4. Preencha o .env

```env
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_GUILD_ID=id_do_seu_servidor
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback
JWT_SECRET=uma_string_aleatoria_longa
ADMIN_DISCORD_IDS=seu_discord_id
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001
VITE_DISCORD_CLIENT_ID=seu_client_id
```

### 5. Inicie os serviços

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Bot
cd bot && npm run dev

# Terminal 3 - Frontend
cd frontend && npm run dev
```

Acesse: http://localhost:5173

## 🤖 Comandos do Bot

| Comando | Descrição |
|---------|-----------|
| `/config` | **Único Slash** — Configuração completa via menus |
| `!painel` | Envia o painel de registro |
| `!hierarquia` | Mostra a hierarquia do clã |
| `!set @user Cargo` | Define o set de um membro |
| `!removeset @user` | Remove o set |
| `!membros [página]` | Lista membros |
| `!perfil [@user]` | Perfil do membro |
| `!logs [qtd]` | Últimos logs |
| `!ajuda` | Lista de comandos |

## 🌐 Deploy

### Frontend (Netlify)

1. Conecte o repositório ou faça upload da pasta `frontend`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Variáveis: `VITE_API_URL`, `VITE_DISCORD_CLIENT_ID`
5. Ajuste o `netlify.toml` com a URL do seu backend

### Backend + Bot (Railway / Render / VPS)

Ambos são Node.js. Configure as variáveis de ambiente do `.env`.

Mantenha o arquivo SQLite persistente (volume).

## 🔐 Segurança

- Token do bot **nunca** vai para o frontend
- JWT + Discord OAuth
- Apenas IDs listados em `ADMIN_DISCORD_IDS` acessam configurações
- Rate limit na API
- Helmet + CORS configurados

## 📝 Personalização

Use `/config` no Discord ou o painel web em **Configurações** para:

- Nome, logo, banner, cores
- Canais de painel, logs, aprovação
- Hierarquia e permissões
- Perguntas do formulário de registro
- Textos do painel e botões

## 🛠️ Tecnologias

- **Bot**: Node.js + Discord.js v14
- **Backend**: Express + better-sqlite3
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Auth**: Discord OAuth2 + JWT

---

Feito para clãs de FiveM. Personalize e use!
