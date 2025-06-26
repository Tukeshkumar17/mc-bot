const mineflayer = require('mineflayer');
const autoeat = require('mineflayer-auto-eat').plugin;
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;

function createBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: parseInt(process.env.MC_PORT),
    username: process.env.MC_USERNAME,
    password: process.env.MC_PASSWORD,
    version: process.env.MC_VERSION
  });

  // ✅ Load plugins correctly
  bot.loadPlugin(autoeat);
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

  bot.once('spawn', () => {
    console.log('✅ Bot spawned and ready!');

    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    // Optional: Uncomment if your server requires /login or /register
    // bot.chat('/register yourpassword yourpassword');
    // bot.chat('/login yourpassword');

    // Random head movement
    setInterval(() => {
      const yaw = (Math.random() - 0.5) * Math.PI;
      const pitch = (Math.random() - 0.5) * Math.PI / 4;
      bot.look(yaw, pitch, true);
    }, 10000);

    // Jumping anti-AFK
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 400);
    }, 20000);
  });

  // Auto-eat
  bot.on('autoeat_started', () => {
    console.log('🍗 Auto-eating started');
  });

  bot.on('autoeat_finished', () => {
    console.log('✅ Done eating');
  });

  bot.on('health', () => {
    if (bot.food < 18) {
      bot.activateItem();
    }
  });

  // Auto-reconnect
  bot.on('end', () => {
    console.log('🔁 Bot disconnected. Reconnecting in 10 seconds...');
    setTimeout(createBot, 10000);
  });

  return bot;
}

module.exports = createBot;
