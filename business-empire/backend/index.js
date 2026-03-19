// backend/index.js
// ============================
// ЕДИНЫЙ СЕРВЕР: API + Бот + Раздача фронтенда
// Всё в одном процессе для Railway
// ============================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Telegraf } = require('telegraf');

const game = require('./game');
const minigames = require('./minigames');

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// Railway даёт PORT автоматически!
// Никогда не хардкодь порт
// ============================
const PORT = process.env.PORT || 3001;

// ============================
// ВАЖНО: Railway URL
// После деплоя Railway даст тебе URL типа:
// https://business-empire-production-xxxx.up.railway.app
// Его нужно вставить в WEBAPP_URL
// ============================
const WEBAPP_URL = process.env.WEBAPP_URL || `http://localhost:${PORT}`;

// ============================
// TELEGRAM BOT (внутри того же процесса)
// ============================
let bot = null;

function startBot() {
  if (!process.env.BOT_TOKEN) {
    console.log('⚠️ BOT_TOKEN не задан, бот не запущен');
    return;
  }

  bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start((ctx) => {
    const userName = ctx.from.first_name || 'Игрок';
    ctx.reply(
      `🏙 Привет, ${userName}!\n\n` +
      `Добро пожаловать в *Бизнес Империю*!\n\n` +
      `Покупай бизнесы в городах России,\n` +
      `зарабатывай монеты и стань магнатом! 💰`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎮 Играть',
              web_app: { url: WEBAPP_URL }
            }
          ]]
        }
      }
    );
  });

  bot.help((ctx) => {
    ctx.reply(
      '📖 *Как играть:*\n\n' +
      '1. Нажми "Играть"\n' +
      '2. Выбирай города на карте\n' +
      '3. Покупай бизнесы\n' +
      '4. Играй в мини-игры\n' +
      '5. Получай пассивный доход!',
      { parse_mode: 'Markdown' }
    );
  });

  // ============================
  // WEBHOOK vs POLLING
  // На Railway используем POLLING (проще для MVP)
  // ============================
  bot.launch({
    dropPendingUpdates: true
  });

  console.log('🤖 Telegram бот запущен (polling)');
}

// ============================
// API ROUTES
// ============================

function getUserId(req) {
  return req.query.userId || req.body.userId || req.headers['x-user-id'] || 'default';
}

// Получить данные игрока
app.get('/api/player', (req, res) => {
  const userId = getUserId(req);
  const collected = game.collectPassiveIncome(userId);
  const player = game.getPlayer(userId);

  res.json({
    coins: Math.floor(player.coins),
    totalPassiveIncome: player.totalPassiveIncome,
    businesses: player.businesses,
    collected
  });
});

// Список городов
app.get('/api/cities', (req, res) => {
  const cities = Object.values(game.CITIES).map(city => ({
    id: city.id,
    name: city.name,
    lat: city.lat,
    lng: city.lng,
    description: city.description
  }));
  res.json(cities);
});

// Детали города
app.get('/api/city/:id', (req, res) => {
  const userId = getUserId(req);
  const cityInfo = game.getCityInfo(req.params.id);

  if (!cityInfo) {
    return res.status(404).json({ error: 'Город не найден' });
  }

  const player = game.getPlayer(userId);
  const playerBusinesses = player.businesses.filter(
    b => b.cityId === req.params.id
  );

  res.json({
    ...cityInfo,
    playerBusinesses,
    playerCoins: Math.floor(player.coins)
  });
});

// Купить бизнес
app.post('/api/buy', (req, res) => {
  const userId = getUserId(req);
  const { cityId, businessTypeId } = req.body;

  game.collectPassiveIncome(userId);
  const result = game.buyBusiness(userId, cityId, businessTypeId);
  res.json(result);
});

// Список мини-игр
app.get('/api/games', (req, res) => {
  res.json(minigames.getAvailableGames());
});

// Сыграть в мини-игру
app.post('/api/play', (req, res) => {
  const userId = getUserId(req);
  const { gameId, result } = req.body;

  const player = game.getPlayer(userId);
  const playResult = minigames.playGame(player, gameId, result);
  res.json(playResult);
});

// Health check (Railway проверяет)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ============================
// РАЗДАЧА ФРОНТЕНДА
// После сборки фронтенд лежит в frontend/dist
// Express раздаёт его как статику
// ============================
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// Все остальные запросы → index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================
// ЗАПУСК
// ============================
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('================================');
  console.log(`🚀 Сервер запущен: порт ${PORT}`);
  console.log(`🌐 URL: ${WEBAPP_URL}`);
  console.log('================================');
  console.log('');

  // Запускаем бота после сервера
  startBot();
});

// Корректное завершение
process.once('SIGINT', () => {
  if (bot) bot.stop('SIGINT');
  process.exit(0);
});
process.once('SIGTERM', () => {
  if (bot) bot.stop('SIGTERM');
  process.exit(0);
});
