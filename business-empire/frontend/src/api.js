// frontend/src/api.js

const API_BASE = '/api';

// Получаем userId из Telegram WebApp
function getUserId() {
  try {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    }
  } catch (e) {}
  return 'test_user_123'; // fallback для разработки
}

const userId = getUserId();

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
