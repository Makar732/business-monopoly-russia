// frontend/src/api.js

// ============================
// На Railway фронт и бэк на ОДНОМ домене
// Поэтому API_BASE — просто /api
// ============================
const API_BASE = '/api';

function getUserId() {
  try {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    }
  } catch (e) {}
  return 'test_user_' + Math.random().toString(36).substr(2, 6);
}

// Кешируем userId чтобы не менялся
let cachedUserId = null;
function getStableUserId() {
  if (!cachedUserId) {
    cachedUserId = getUserId();
    // Сохраняем в localStorage для стабильности
    const stored = localStorage.getItem('userId');
    if (stored) {
      cachedUserId = stored;
    } else {
      localStorage.setItem('userId', cachedUserId);
    }
  }
  return cachedUserId;
}

const userId = getStableUserId();

export async function fetchPlayer() {
  const res = await fetch(`${API_BASE}/player?userId=${userId}`);
  return res.json();
}

export async function fetchCities() {
  const res = await fetch(`${API_BASE}/cities`);
  return res.json();
}

export async function fetchCity(cityId) {
  const res = await fetch(`${API_BASE}/city/${cityId}?userId=${userId}`);
  return res.json();
}

export async function buyBusiness(cityId, businessTypeId) {
  const res = await fetch(`${API_BASE}/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, cityId, businessTypeId })
  });
  return res.json();
}

export async function fetchGames() {
  const res = await fetch(`${API_BASE}/games`);
  return res.json();
}

export async function playGame(gameId, result) {
  const res = await fetch(`${API_BASE}/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, gameId, result })
  });
  return res.json();
}
