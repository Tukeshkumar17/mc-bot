const mineflayer = require('mineflayer');
const autoeat = require('mineflayer-auto-eat').plugin;
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalNear } = require('mineflayer-pathfinder').goals;
const minecraftData = require('minecraft-data');
const pvp = require('mineflayer-pvp').plugin;

let bot = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 15000; // 15 seconds

function createBot(io = null) {
  try {
    // Validate environment variables
    if (!process.env.MC_HOST || !process.env.MC_PORT || !process.env.MC_USERNAME) {
      throw new Error('Missing required environment variables (MC_HOST, MC_PORT, MC_USERNAME)');
    }

    console.log(`🔄 Creating bot (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
    
    bot = mineflayer.createBot({
      host: process.env.MC_HOST,
      port: parseInt(process.env.MC_PORT) || 25565,
      username: process.env.MC_USERNAME,
      password: process.env.MC_PASSWORD || undefined,
      version: process.env.MC_VERSION || 'latest',
      auth: process.env.MC_PASSWORD ? 'microsoft' : 'offline',
      skipValidation: true,
    });

    // Load plugins with error handling
    try {
      bot.loadPlugin(autoeat);
      bot.loadPlugin(pathfinder);
      bot.loadPlugin(pvp);
      console.log('✅ Plugins loaded successfully');
    } catch (pluginError) {
      console.error('❌ Error loading plugins:', pluginError.message);
    }

    // Bot spawn event
    bot.once('spawn', () => {
      console.log(`✅ Bot "${bot.username}" spawned successfully!`);
      console.log(`📍 Position: ${bot.entity.position.x.toFixed(1)}, ${bot.entity.position.y.toFixed(1)}, ${bot.entity.position.z.toFixed(1)}`);
      
      reconnectAttempts = 0; // Reset reconnect attempts on successful spawn
      
      if (io) {
        io.emit('botStatus', {
          status: 'online',
          username: bot.username,
          position: bot.entity.position,
          health: bot.health,
          food: bot.food
        });
      }

      try {
        const mcData = minecraftData(bot.version);
        const defaultMove = new Movements(bot, mcData);
        defaultMove.allowFreeMotion = true;
        defaultMove.canDig = false;
        bot.pathfinder.setMovements(defaultMove);
        console.log('🗺️ Pathfinder configured');
      } catch (pathfinderError) {
        console.error('❌ Pathfinder setup error:', pathfinderError.message);
      }

      // Start anti-AFK behaviors
      startAntiAFK();
    });

    // Login event
    bot.on('login', () => {
      console.log(`🔐 Bot logged in as "${bot.username}"`);
    });

    // Health monitoring
    bot.on('health', () => {
      if (bot.health <= 0) {
        console.log('💀 Bot died, respawning...');
        bot.respawn();
      }
      
      if (io) {
        io.emit('botStats', {
          health: bot.health,
          food: bot.food,
          position: bot.entity?.position
        });
      }
    });

    // Auto-eat events
    bot.on('autoeat_started', () => {
      console.log('🍗 Auto eating...');
      if (io) io.emit('botAction', 'eating');
    });

    bot.on('autoeat_finished', () => {
      console.log('✅ Done eating');
      if (io) io.emit('botAction', 'finished_eating');
    });

    bot.on('autoeat_error', (error) => {
      console.log('🚫 Auto-eat error:', error.message);
    });

    // Chat events
    bot.on('chat', (username, message) => {
      if (username === bot.username) return;
      
      console.log(`💬 ${username}: ${message}`);
      if (io) {
        io.emit('chatMessage', { username, message });
      }

      // Basic command handling
      handleCommands(username, message);
    });

    // Kicked event
    bot.on('kicked', (reason) => {
      console.log('👢 Bot was kicked:', reason);
      if (io) io.emit('botStatus', { status: 'kicked', reason });
      scheduleReconnect(io);
    });

    // Error handling
    bot.on('error', (err) => {
      console.error('❌ Bot error:', err.message);
      if (io) io.emit('botError', err.message);
      
      // Don't reconnect for authentication errors
      if (err.message.includes('Invalid credentials') || err.message.includes('authentication')) {
        console.error('🚫 Authentication failed. Please check your credentials.');
        return;
      }
      
      scheduleReconnect(io);
    });

    // End event (disconnect)
    bot.on('end', (reason) => {
      console.log('🔌 Bot disconnected:', reason);
      if (io) io.emit('botStatus', { status: 'disconnected', reason });
      scheduleReconnect(io);
    });

    // Death event
    bot.on('death', () => {
      console.log('💀 Bot died!');
      if (io) io.emit('botAction', 'died');
      
      setTimeout(() => {
        try {
          bot.respawn();
          console.log('🔄 Respawned');
        } catch (respawnError) {
          console.error('❌ Respawn error:', respawnError.message);
        }
      }, 1000);
    });

    return bot;

  } catch (error) {
    console.error('❌ Failed to create bot:', error.message);
    if (io) io.emit('botError', `Failed to create bot: ${error.message}`);
    scheduleReconnect(io);
    return null;
  }
}

function scheduleReconnect(io) {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`🚫 Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping.`);
    if (io) io.emit('botStatus', { status: 'failed', reason: 'Max reconnection attempts reached' });
    return;
  }

  reconnectAttempts++;
  console.log(`🔁 Reconnecting in ${RECONNECT_DELAY / 1000} seconds... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  
  if (io) {
    io.emit('botStatus', { 
      status: 'reconnecting', 
      attempt: reconnectAttempts, 
      maxAttempts: MAX_RECONNECT_ATTEMPTS,
      delay: RECONNECT_DELAY / 1000
    });
  }

  setTimeout(() => {
    createBot(io);
  }, RECONNECT_DELAY);
}

function startAntiAFK() {
  if (!bot) return;

  // Random looking around
  const lookInterval = setInterval(() => {
    if (!bot || !bot.entity) {
      clearInterval(lookInterval);
      return;
    }
    
    try {
      const yaw = (Math.random() - 0.5) * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI * 0.5;
      bot.look(yaw, pitch, true);
    } catch (error) {
      console.error('❌ Look error:', error.message);
    }
  }, 8000 + Math.random() * 4000); // 8-12 seconds

  // Random jumping
  const jumpInterval = setInterval(() => {
    if (!bot || !bot.entity) {
      clearInterval(jumpInterval);
      return;
    }
    
    try {
      bot.setControlState('jump', true);
      setTimeout(() => {
        if (bot) bot.setControlState('jump', false);
      }, 200 + Math.random() * 200);
    } catch (error) {
      console.error('❌ Jump error:', error.message);
    }
  }, 12000 + Math.random() * 8000); // 12-20 seconds

  // Random small movements
  const moveInterval = setInterval(() => {
    if (!bot || !bot.entity) {
      clearInterval(moveInterval);
      return;
    }
    
    try {
      const actions = ['forward', 'back', 'left', 'right'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      bot.setControlState(action, true);
      setTimeout(() => {
        if (bot) bot.setControlState(action, false);
      }, 100 + Math.random() * 300);
    } catch (error) {
      console.error('❌ Movement error:', error.message);
    }
  }, 20000 + Math.random() * 10000); // 20-30 seconds

  // Cleanup intervals when bot disconnects
  bot.on('end', () => {
    clearInterval(lookInterval);
    clearInterval(jumpInterval);
    clearInterval(moveInterval);
  });
}

function handleCommands(username, message) {
  if (!bot) return;

  const command = message.toLowerCase().trim();
  
  try {
    switch (command) {
      case '!pos':
        if (bot.entity) {
          const pos = bot.entity.position;
          bot.chat(`Position: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`);
        }
        break;
      
      case '!health':
        bot.chat(`Health: ${bot.health}/20, Food: ${bot.food}/20`);
        break;
      
      case '!time':
        const time = bot.time.timeOfDay;
        const hours = Math.floor(time / 1000);
        const minutes = Math.floor((time % 1000) / 16.67);
        bot.chat(`Time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        break;
      
      case '!ping':
        bot.chat('Pong! Bot is active.');
        break;
    }
  } catch (error) {
    console.error('❌ Command error:', error.message);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (bot) {
    bot.quit('Shutting down');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  if (bot) {
    bot.quit('Server shutdown');
  }
  process.exit(0);
});

module.exports = { createBot, getBot: () => bot };
