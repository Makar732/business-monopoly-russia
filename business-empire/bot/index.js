// bot/index.js
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// ============================
// Команда /start
// ============================
bot.start((ctx) => {
  const userName = ctx.from.first_name || 'Игрок';

  ctx.reply(
    `🏙 Привет, ${userName}!\n\n` +
    `Добро пожаловать в *Бизнес Империю*!\n\n` +
    `Покупай бизнесы в городах России,\n` +
    `зарабатывай монеты и стань магнатом! 💰\n\n` +
    `Нажми кнопку ниже, чтобы начать 👇`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть', process.env.WEBAPP_URL)]
      ])
    }
  );
});

// Команда /help
bot.help((ctx) => {
  ctx.reply(
    '📖 *Как играть:*\n\n' +
    '1. Открой WebApp кнопкой "Играть"\n' +
    '2. Выбирай города на карте\n' +
    '3. Покупай бизнесы\n' +
    '4. Играй в мини-игры для заработка\n' +
    '5. Получай пассивный доход каждую минуту!',
    { parse_mode: 'Markdown' }
  );
});

bot.launch();
console.log('🤖 Бот запущен!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
