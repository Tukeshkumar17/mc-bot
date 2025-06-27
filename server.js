require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const { createBot, getBot } = require('./bot');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let bot = null;
let botStats = {
  status: 'offline',
  username: null,
  health: 0,
  food: 0,
  position: null,
  uptime: null,
  startTime: null
};

// Initialize bot
function initializeBot() {
  try {
    botStats.startTime = new Date();
    bot = createBot(io);
    
    if (bot) {
      console.log('🤖 Bot initialization started...');
      
      // Update stats when bot comes online
      bot.once('spawn', () => {
        botStats.status = 'online';
        botStats.username = bot.username;
        updateBotStats();
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize bot:', error.message);
    botStats.status = 'error';
    io.emit('botError', error.message);
  }
}

function updateBotStats() {
  if (bot && bot.entity) {
    botStats.health = bot.health || 0;
    botStats.food = bot.food || 0;
    botStats.position = bot.entity.position;
    botStats.uptime = botStats.startTime ? new Date() - botStats.startTime : 0;
  }
}

// Express middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'dashboard', 'views'));
app.use(express.static(path.join(__dirname, 'dashboard', 'public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  try {
    updateBotStats();
    res.render('index', { 
      username: process.env.MC_USERNAME || 'Unknown',
      host: process.env.MC_HOST || 'Unknown',
      port: process.env.MC_PORT || 'Unknown',
      version: process.env.MC_VERSION || 'latest',
      stats: botStats
    });
  } catch (error) {
    console.error('❌ Route error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// API endpoints
app.get('/api/status', (req, res) => {
  updateBotStats();
  res.json(botStats);
});

app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (bot && bot.chat) {
      bot.chat(message);
      res.json({ success: true, message: 'Message sent' });
    } else {
      res.status(503).json({ error: 'Bot is not connected' });
    }
  } catch (error) {
    console.error('❌ Chat API error:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/restart', (req, res) => {
  try {
    console.log('🔄 Manual bot restart requested...');
    if (bot) {
      bot.quit('Manual restart');
    }
    
    setTimeout(() => {
      initializeBot();
    }, 2000);
    
    res.json({ success: true, message: 'Bot restart initiated' });
  } catch (error) {
    console.error('❌ Restart API error:', error.message);
    res.status(500).json({ error: 'Failed to restart bot' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Dashboard client connected:', socket.id);
  
  // Send current bot status to new client
  updateBotStats();
  socket.emit('botStatus', botStats);
  
  // Handle chat messages from dashboard
  socket.on('chat', (message) => {
    try {
      if (!message || message.trim() === '') return;
      
      if (bot && bot.chat) {
        bot.chat(message);
        console.log(`💬 Dashboard sent: ${message}`);
        
        // Broadcast to all clients
        io.emit('chatMessage', {
          username: botStats.username,
          message: message,
          source: 'dashboard'
        });
      } else {
        socket.emit('error', 'Bot is not connected');
      }
    } catch (error) {
      console.error('❌ Socket chat error:', error.message);
      socket.emit('error', 'Failed to send message');
    }
  });
  
  // Handle bot restart from dashboard
  socket.on('restartBot', () => {
    try {
      console.log('🔄 Dashboard requested bot restart...');
      if (bot) {
        bot.quit('Dashboard restart');
      }
      
      setTimeout(() => {
        initializeBot();
      }, 2000);
      
      io.emit('notification', 'Bot restart initiated');
    } catch (error) {
      console.error('❌ Socket restart error:', error.message);
      socket.emit('error', 'Failed to restart bot');
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Dashboard client disconnected:', socket.id);
  });
});

// Periodic status updates
setInterval(() => {
  updateBotStats();
  io.emit('statsUpdate', botStats);
}, 5000);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Express error:', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Dashboard running at http://localhost:${PORT}`);
  console.log('📊 Server started successfully');
  
  // Initialize bot after server starts
  setTimeout(() => {
    initializeBot();
  }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  if (bot) {
    bot.quit('Server shutdown');
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM...');
  if (bot) {
    bot.quit('Server termination');
  }
  server.close(() => {
    process.exit(0);
  });
});

module.exports = { app, server, io };
