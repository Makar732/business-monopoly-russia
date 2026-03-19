// frontend/src/components/CityScreen.jsx
import React, { useState, useEffect } from 'react';
import { fetchCity, buyBusiness } from '../api';

export default function CityScreen({ cityId, onBack, onUpdate }) {
  const [city, setCity] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCity();
  }, [cityId]);

  async function loadCity() {
    setLoading(true);
    try {
      const data = await fetchCity(cityId);
      setCity(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleBuy(businessTypeId) {
    setMessage('');
    const result = await buyBusiness(cityId, businessTypeId);

    if (result.success) {
      setMessage(`✅ Куплено! -${result.cost} монет`);
      loadCity();    // обновить экран города
      onUpdate();    // обновить header (баланс)
    } else {
      setMessage(`❌ ${result.error}`);
    }

    // Убираем сообщение через 3 сек
    setTimeout(() => setMessage(''), 3000);
  }

  if (loading) return <div className="screen loading">Загрузка...</div>;
  if (!city) return <div className="screen">Город не найден</div>;

  return (
    <div className="screen city-screen">
      {/* Шапка города */}
      <div className="city-header">
        <button className="btn-back" onClick={onBack}>← Карта</button>
        <h2>🏙 {city.name}</h2>
        <p className="city-desc">{city.description}</p>
        <p className="player-coins">💰 {city.playerCoins} монет</p>
      </div>

      {/* Уведомление */}
      {message && <div className="message">{message}</div>}

      {/* ============================
          Доступные бизнесы
          ============================ */}
      <h3>Купить бизнес:</h3>
      <div className="business-list">
        {city.businesses.map(biz => (
          <div key={biz.id} className="business-card">
            <div className="business-info">
              <span className="business-icon">{biz.icon}</span>
              <div>
                <strong>{biz.name}</strong>
                <p>💰 Цена: {biz.cost}</p>
                <p>📈 Доход: +{biz.income}/мин</p>
              </div>
            </div>
            <button
              className="btn btn-buy"
              onClick={() => handleBuy(biz.id)}
            >
              Купить
            </button>
          </div>
        ))}
      </div>

      {/* ============================
          Мои бизнесы в этом городе
          ============================ */}
      {city.playerBusinesses.length > 0 && (
        <>
          <h3>Мои бизнесы здесь:</h3>
          <div className="my-businesses">
            {city.playerBusinesses.map(biz => (
              <div key={biz.id} className="business-card owned">
                <span>{biz.icon}</span>
                <span>{biz.typeName}</span>
                <span className="income">+{biz.income}/мин</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
