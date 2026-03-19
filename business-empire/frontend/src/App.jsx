// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import CityScreen from './components/CityScreen';
import WorkScreen from './components/WorkScreen';
import { fetchPlayer } from './api';

export default function App() {
  // ============================
  // Текущий экран: 'map' | 'city' | 'work'
  // ============================
  const [screen, setScreen] = useState('map');
  const [selectedCity, setSelectedCity] = useState(null);
  const [player, setPlayer] = useState({
    coins: 0,
    totalPassiveIncome: 0,
    businesses: []
  });

  // Загружаем данные игрока при старте
  useEffect(() => {
    loadPlayer();

    // Обновляем данные каждые 30 сек
    const interval = setInterval(loadPlayer, 30000);
    return () => clearInterval(interval);
  }, []);

  // Инициализируем Telegram WebApp
  useEffect(() => {
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      }
    } catch (e) {}
  }, []);

  async function loadPlayer() {
    try {
      const data = await fetchPlayer();
      setPlayer(data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    }
  }

  // Открыть город
  function openCity(cityId) {
    setSelectedCity(cityId);
    setScreen('city');
  }

  // Навигация
  function goToMap() { setScreen('map'); }
  function goToWork() { setScreen('work'); }

  return (
    <div className="app">
      <Header
        coins={player.coins}
        passiveIncome={player.totalPassiveIncome}
      />

      {/* ============================
          Навигация (табы внизу)
          ============================ */}
      <div className="nav-tabs">
        <button
          className={screen === 'map' ? 'active' : ''}
          onClick={goToMap}
        >
          🗺 Карта
        </button>
        <button
          className={screen === 'work' ? 'active' : ''}
          onClick={goToWork}
        >
          👷 Работа
        </button>
      </div>

      {/* ============================
          Экраны
          ============================ */}
      <div className="screen-container">
        {screen === 'map' && (
          <MapView onCityClick={openCity} />
        )}

        {screen === 'city' && selectedCity && (
          <CityScreen
            cityId={selectedCity}
            onBack={goToMap}
            onUpdate={loadPlayer}
          />
        )}

        {screen === 'work' && (
          <WorkScreen onUpdate={loadPlayer} />
        )}
      </div>
    </div>
  );
}
