// frontend/src/components/ReactionGame.jsx
import React, { useState, useRef } from 'react';
import { playGame } from '../api';

// ============================
// МИНИ-ИГРА: РЕАКЦИЯ
// Нажми на кнопку, когда она станет зелёной
// ============================
export default function ReactionGame({ onComplete }) {
  // Состояния: waiting | ready | go | result
  const [state, setState] = useState('waiting');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  // ============================
  // Шаг 1: Игрок нажимает "Начать"
  // ============================
  function startGame() {
    setState('ready');
    setResult(null);
    setMessage('Жди зелёный цвет...');

    // Случайная задержка 1-4 секунды
    const delay = 1000 + Math.random() * 3000;

    timerRef.current = setTimeout(() => {
      setState('go');
      setMessage('ЖМИИИИ! 🟢');
      startTimeRef.current = Date.now();
    }, delay);
  }

  // ============================
  // Шаг 2: Игрок нажимает на кнопку
  // ============================
  async function handleClick() {
    if (state === 'ready') {
      // Нажал слишком рано!
      clearTimeout(timerRef.current);
      setState('waiting');
      setMessage('😅 Слишком рано! Попробуй ещё раз.');
      return;
    }

    if (state === 'go') {
      // Считаем время реакции
      const reactionTime = Date.now() - startTimeRef.current;
      setState('result');

      // Отправляем результат на сервер
      try {
        const response = await playGame('reaction', { reactionTime });

        if (response.success) {
          setResult({
            reactionTime,
            reward: response.reward,
            message: response.message
          });
        } else {
          setMessage(response.error);
          setState('waiting');
        }
      } catch (err) {
        setMessage('Ошибка сети');
        setState('waiting');
      }
    }
  }

  return (
    <div className="minigame reaction-game">
      <h3>⚡ Тест реакции</h3>

      {/* ============================
          Игровое поле
          ============================ */}
      <div
        className={`reaction-zone ${state}`}
        onClick={handleClick}
      >
        {state === 'waiting' && (
          <div className="reaction-content">
            <p>Проверь свою реакцию!</p>
            <button className="btn btn-start" onClick={startGame}>
              🎮 Начать
            </button>
          </div>
        )}

        {state === 'ready' && (
          <div className="reaction-content ready">
            <p>⏳ Жди...</p>
            <p className="hint">Нажми когда станет зелёным</p>
          </div>
        )}

        {state === 'go' && (
          <div className="reaction-content go">
            <p className="go-text">ЖМИИИИ! 🟢</p>
          </div>
        )}

        {state === 'result' && result && (
          <div className="reaction-content result">
            <p className="result-message">{result.message}</p>
            <p className="reaction-time">⏱ {result.reactionTime} мс</p>
            <p className="reward">+{result.reward} 💰</p>
            <button className="btn" onClick={() => { setState('waiting'); onComplete(); }}>
              Готово
            </button>
            <button className="btn btn-retry" onClick={startGame}>
              🔄 Ещё раз
            </button>
          </div>
        )}
      </div>

      {/* Сообщение */}
      {message && state === 'waiting' && (
        <p className="game-message">{message}</p>
      )}

      <button className="btn btn-back-small" onClick={onComplete}>
        ← Назад к списку
      </button>
    </div>
  );
}
