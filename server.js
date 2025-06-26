require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const createBot = require('./bot');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const bot = createBot();

app.set('view engine', 'ejs');
app.use(express.static('dashboard/public'));

app.get('/', (req, res) => {
  res.render('index', { username: process.env.MC_USERNAME });
});

io.on('connection', (socket) => {
  console.log('🔌 Dashboard connected');
  socket.emit('status', 'Bot Online');

  socket.on('chat', (msg) => {
    bot.chat(msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🌐 Dashboard running at http://localhost:${PORT}`));
