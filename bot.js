const mineflayer = require('mineflayer');
const autoeat = require('mineflayer-auto-eat').plugin;
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const minecraftData = require('minecraft-data');
const pvp = require('mineflayer-pvp').plugin;

function createBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: parseInt(process.env.MC_PORT),
    username: process.env.MC_USERNAME,
    password: process.env.MC_PASSWORD,
    version: process.env.MC_VERSION,
  });

  // ✅ Load each plugin correctly
  bot.loadPlugin(autoeat);
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

  bot.once('spawn', () => {
    console.log('✅ Bot is online!');

    const mcData = minecraftData(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    // Example movement / anti-AFK
    setInterval(() => {
      const yaw = Math.random() * Math.PI * 2;
      const pitch = 0;
      bot.look(yaw, pitch, true);
    }, 10000);

    // Jumping anti-AFK
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }, 15000);
  });

  bot.on('autoeat_started', () => {
    console.log('🍗 Auto eating...');
  });

  bot.on('autoeat_finished', () => {
    console.log('✅ Done eating');
  });

  bot.on('health', () => {
    if (bot.food < 18) {
      bot.activateItem();
    }
  });

  bot.on('end', () => {
    console.log('🔁 Bot disconnected, retrying in 10s...');
    setTimeout(createBot, 10000);
  });

  return bot;
}

module.exports = createBot;
