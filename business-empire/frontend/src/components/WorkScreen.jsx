// frontend/src/components/WorkScreen.jsx
import React, { useState, useEffect } from 'react';
import { fetchGames } from '../api';
import ReactionGame from './ReactionGame';

export default function WorkScreen({ onUpdate }) {
  const [games, setGames] = useState([]);
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    fetchGames().then(setGames).catch(console.error);
  }, []);

  function handleGameComplete() {
    setActiveGame(null);
    onUpdate(); // обновляем баланс
  }

  return (
    <div className="screen work-screen">
      <h2>👷 Работа</h2>
      <p>Играй в мини-игры и зарабатывай монеты!</p>

      {/* ============================
          Если игра активна — показываем её
          ============================ */}
      {activeGame === 'reaction' && (
        <ReactionGame onComplete={handleGameComplete} />
      )}

      {/* ============================
          Список мини-игр
          ============================ */}
      {!activeGame && (
        <div className="games-list">
          {games.map(game => (
            <div key={game.id} className="game-card">
              <div>
                <strong>{game.name}</strong>
                <p>{game.description}</p>
              </div>
              <button
                className="btn btn-play"
                onClick={() => setActiveGame(game.id)}
              >
                Играть
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
