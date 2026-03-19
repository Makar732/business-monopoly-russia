// backend/game.js

// ============================
// КОНФИГУРАЦИЯ ГОРОДОВ
// Легко добавлять новые — просто добавь объект в массив
// ============================
const CITIES = {
  moscow: {
    id: 'moscow',
    name: 'Москва',
    lat: 55.7558,
    lng: 37.6173,
    costMultiplier: 1.5,    // дорогой город
    incomeMultiplier: 1.8,  // но и доход выше
    description: 'Столица — дорого, но прибыльно'
  },
  spb: {
    id: 'spb',
    name: 'Санкт-Петербург',
    lat: 59.9343,
    lng: 30.3351,
    costMultiplier: 1.2,
    incomeMultiplier: 1.4,
    description: 'Культурная столица'
  },
  nn: {
    id: 'nn',
    name: 'Нижний Новгород',
    lat: 56.2965,
    lng: 43.9361,
    costMultiplier: 0.8,    // дешёвый город
    incomeMultiplier: 1.0,
    description: 'Доступный старт для новичков'
  }
};

// ============================
// ТИПЫ БИЗНЕСОВ
// Легко добавлять новые — просто добавь объект
// ============================
const BUSINESS_TYPES = {
  cafe: {
    id: 'cafe',
    name: '☕ Кафе',
    baseCost: 100,
    baseIncome: 2,  // coins в минуту
    icon: '☕',
    description: 'Уютное кафе с кофе и пирожками'
  },
  shop: {
    id: 'shop',
    name: '🏪 Магазин',
    baseCost: 250,
    baseIncome: 5,
    icon: '🏪',
    description: 'Продуктовый магазин у дома'
  }
};

// ============================
// ХРАНИЛИЩЕ ИГРОКОВ (in-memory)
// Для MVP этого достаточно. Потом заменить на БД
// ============================
const players = {};

// Создать или получить игрока
function getPlayer(userId) {
  if (!players[userId]) {
    players[userId] = {
      id: userId,
      coins: 500,            // стартовые монеты
      businesses: [],         // купленные бизнесы
      totalPassiveIncome: 0,  // общий пассивный доход/мин
      lastIncomeTime: Date.now(),
      workCooldown: 0         // кулдаун мини-игр
    };
  }
  return players[userId];
}

// ============================
// Посчитать и начислить пассивный доход
// Вызывается при каждом запросе игрока
// ============================
function collectPassiveIncome(userId) {
  const player = getPlayer(userId);
  const now = Date.now();
  const minutesPassed = (now - player.lastIncomeTime) / 60000;

  if (minutesPassed >= 1) {
    const fullMinutes = Math.floor(minutesPassed);
    const earned = fullMinutes * player.totalPassiveIncome;
    player.coins += earned;
    player.lastIncomeTime = now;

    return {
      earned,
      minutes: fullMinutes
    };
  }

  return { earned: 0, minutes: 0 };
}

// ============================
// Купить бизнес
// ============================
function buyBusiness(userId, cityId, businessTypeId) {
  const player = getPlayer(userId);
  const city = CITIES[cityId];
  const businessType = BUSINESS_TYPES[businessTypeId];

  if (!city || !businessType) {
    return { success: false, error: 'Город или бизнес не найден' };
  }

  // Считаем цену с учётом коэффициента города
  const cost = Math.round(businessType.baseCost * city.costMultiplier);
  const income = +(businessType.baseIncome * city.incomeMultiplier).toFixed(1);

  if (player.coins < cost) {
    return {
      success: false,
      error: `Не хватает монет! Нужно ${cost}, у тебя ${Math.floor(player.coins)}`
    };
  }

  // Покупаем
  player.coins -= cost;

  const newBusiness = {
    id: `${cityId}_${businessTypeId}_${Date.now()}`,
    cityId,
    cityName: city.name,
    typeId: businessTypeId,
    typeName: businessType.name,
    icon: businessType.icon,
    income,
    boughtAt: Date.now()
  };

  player.businesses.push(newBusiness);

  // Пересчитываем общий пассивный доход
  player.totalPassiveIncome = player.businesses.reduce(
    (sum, b) => sum + b.income, 0
  );

  return {
    success: true,
    business: newBusiness,
    cost,
    newBalance: Math.floor(player.coins)
  };
}

// ============================
// Получить инфо о городе для игрока
// ============================
function getCityInfo(cityId) {
  const city = CITIES[cityId];
  if (!city) return null;

  // Формируем список бизнесов с ценами для этого города
  const availableBusinesses = Object.values(BUSINESS_TYPES).map(bt => ({
    ...bt,
    cost: Math.round(bt.baseCost * city.costMultiplier),
    income: +(bt.baseIncome * city.incomeMultiplier).toFixed(1)
  }));

  return {
    ...city,
    businesses: availableBusinesses
  };
}

module.exports = {
  CITIES,
  BUSINESS_TYPES,
  getPlayer,
  collectPassiveIncome,
  buyBusiness,
  getCityInfo
};
