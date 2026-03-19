// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const game = require('./game');
const minigames = require('./minigames');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 3001;

// ============================
// MIDDLEWARE: простая "авторизация" по userId
// В проде — проверять initData от Telegram
// ============================
function getUserId(req) {
  // Для MVP берём userId из query/body/header
  return req.query.userId || req.body.userId || req.headers['x-user-id'] || 'default';
}

// ============================
// GET /api/player — получить данные игрока
// ============================
app.get('/api/player', (req, res) => {
  const userId = getUserId(req);
  const collected = game.collectPassiveIncome(userId);
  const player = game.getPlayer(userId);

  res.json({
    coins: Math.floor(player.coins),
    totalPassiveIncome: player.totalPassiveIncome,
    businesses: player.businesses,
    collected // сколько собрали пассивного дохода
  });
});

// ============================
// GET /api/cities — список городов для карты
// ============================
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

// ============================
// GET /api/city/:id — детали города
// ============================
app.get('/api/city/:id', (req, res) => {
  const userId = getUserId(req);
  const cityInfo = game.getCityInfo(req.params.id);

  if (!cityInfo) {
    return res.status(404).json({ error: 'Город не найден' });
  }

  // Добавляем инфу о бизнесах игрока в этом городе
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

// ============================
// POST /api/buy — купить бизнес
// ============================
app.post('/api/buy', (req, res) => {
  const userId = getUserId(req);
  const { cityId, businessTypeId } = req.body;

  // Сначала собираем накопившийся доход
  game.collectPassiveIncome(userId);

  const result = game.buyBusiness(userId, cityId, businessTypeId);
  res.json(result);
});

// ============================
// GET /api/games — список мини-игр
// ============================
app.get('/api/games', (req, res) => {
  res.json(minigames.getAvailableGames());
});

// ============================
// POST /api/play — сыграть в мини-игру
// ============================
app.post('/api/play', (req, res) => {
  const userId = getUserId(req);
  const { gameId, result } = req.body;

  const player = game.getPlayer(userId);
  const playResult = minigames.playGame(player, gameId, result);

  res.json(playResult);
});

// ============================
// ПАССИВНЫЙ ДОХОД — тикер
// Каждую минуту обновляем всех игроков
// ============================
setInterval(() => {
  console.log('💰 Тик пассивного дохода...');
  // В реальности collectPassiveIncome вызывается при запросе,
  // но этот тикер — для логов
}, 60000);

app.listen(PORT, () => {
  console.log(`🚀 Backend запущен: http://localhost:${PORT}`);
});
