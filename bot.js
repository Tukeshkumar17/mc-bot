const mineflayer = require('mineflayer');
const autoeat = require('mineflayer-auto-eat').plugin;
const { pathfinder, Movements } = require('mineflayer-pathfinder');

function createBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: parseInt(process.env.MC_PORT),
    username: process.env.MC_USERNAME,
    password: process.env.MC_PASSWORD,
    version: process.env.MC_VERSION
  });

  bot.loadPlugin(autoeat);
  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    console.log('✅ Bot spawned and ready!');
    bot.chat('/register yourpassword yourpassword'); // Optional: For cracked servers
    bot.chat('/login yourpassword'); // Optional: For cracked servers

    // Look around randomly
    setInterval(() => {
      const yaw = (Math.random() - 0.5) * Math.PI;
      const pitch = (Math.random() - 0.5) * Math.PI / 4;
      bot.look(yaw, pitch, true);
    }, 10000);

    // Anti-AFK jumping
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 20000);
  });

  bot.on('autoeat_started', () => console.log('🍗 Auto-eating'));
  bot.on('autoeat_finished', () => console.log('✅ Done eating'));

  bot.on('health', () => {
    if (bot.food < 18) bot.activateItem();
  });

  // Auto-reconnect on disconnect
  bot.on('end', () => {
    console.log('🔁 Bot disconnected. Reconnecting in 10 seconds...');
    setTimeout(createBot, 10000);
  });

  return bot;
}

module.exports = createBot;
