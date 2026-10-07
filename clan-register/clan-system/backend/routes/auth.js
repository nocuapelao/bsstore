const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify'
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Código ausente');

  try {
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const { access_token } = tokenRes.data;
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userRes.data;
    const admins = (process.env.ADMIN_DISCORD_IDS || '').split(',').map(s => s.trim());
    const isAdmin = admins.includes(user.id);

    const token = jwt.sign(
      { id: user.id, username: user.username, avatar: user.avatar, isAdmin },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontend}/auth/callback?token=${token}`);
  } catch (err) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.status(500).send('Erro na autenticação');
  }
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Não autenticado' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'secret');
    res.json(decoded);
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
