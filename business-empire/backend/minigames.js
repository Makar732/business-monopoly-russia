// backend/minigames.js

// ============================
// СИСТЕМА МИНИ-ИГР
// Легко добавлять новые — создай функцию и добавь в GAMES
// ============================

const WORK_COOLDOWN = 30000; // 30 секунд между играми

// ============================
// Мини-игра: Реакция (reaction)
// Игрок должен нажать в нужный момент
// ============================
function processReactionGame(playerData, result) {
  // result.reactionTime — время реакции в мс (от фронтенда)
  const reactionTime = result.reactionTime;

  let reward = 0;
  let message = '';

  if (reactionTime < 200) {
    // Подозрительно быстро — возможно чит
    reward = 0;
    message = '⚠️ Слишком быстро! Попробуй ещё раз.';
  } else if (reactionTime < 400) {
    reward = 50;
    message = '⚡ Невероятно! Отличная реакция!';
  } else if (reactionTime < 700) {
    reward = 30;
    message = '👍 Хорошая реакция!';
  } else if (reactionTime < 1000) {
    reward = 15;
    message = '😐 Неплохо, но можно лучше';
  } else {
    reward = 5;
    message = '🐌 Медленно... Но монетки всё равно твои!';
  }

  return { reward, message };
}

// ============================
// Реестр мини-игр
// Чтобы добавить новую — просто добавь сюда
// ============================
const GAMES = {
  reaction: {
    id: 'reaction',
    name: '⚡ Реакция',
    description: 'Нажми на кнопку как можно быстрее!',
    process: processReactionGame
  }
  // Сюда легко добавить:
  // memory: { ... },
  // quiz: { ... },
  // tapping: { ... }
};

// ============================
// Обработка результата мини-игры
// ============================
function playGame(player, gameId, result) {
  const now = Date.now();

  // Проверяем кулдаун
  if (player.workCooldown && now < player.workCooldown) {
    const secondsLeft = Math.ceil((player.workCooldown - now) / 1000);
    return {
      success: false,
      error: `Подожди ${secondsLeft} сек. перед следующей игрой`
    };
  }

  const game = GAMES[gameId];
  if (!game) {
    return { success: false, error: 'Игра не найдена' };
  }

  // Обрабатываем результат
  const { reward, message } = game.process(player, result);

  // Начисляем награду
  player.coins += reward;
  player.workCooldown = now + WORK_COOLDOWN;

  return {
    success: true,
    reward,
    message,
    newBalance: Math.floor(player.coins),
    cooldownUntil: player.workCooldown
  };
}

function getAvailableGames() {
  return Object.values(GAMES).map(g => ({
    id: g.id,
    name: g.name,
    description: g.description
  }));
}

module.exports = { playGame, getAvailableGames, WORK_COOLDOWN };
