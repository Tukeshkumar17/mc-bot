const express = require('express');
const { createBot, getBot, stopBot } = require('./bot/bot');
const { startTasks } = require('./bot/tasks');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

let bot = createBot(io);
setTimeout(() => startTasks(bot), 10000);

app.get('/', (req, res) => {
  const b = getBot();
  res.render('dashboard', {
    online: !!b?.entity,
    username: b?.username || 'Not connected',
    health: b?.health || 0,
    food: b?.food || 0,
    pos: b?.entity?.position || {}
  });
});

app.post('/start', (req, res) => {
  if (!getBot()) {
    bot = createBot(io);
    setTimeout(() => startTasks(bot), 10000);
  }
  res.redirect('/');
});

app.post('/stop', (req, res) => {
  stopBot();
  res.redirect('/');
});

app.post('/command', (req, res) => {
  const cmd = req.body.cmd;
  const b = getBot();
  if (b && cmd) b.chat(cmd);
  res.redirect('/');
});

io.on('connection', socket => {
  const b = getBot();
  if (b) {
    socket.emit('status', {
      health: b.health,
      food: b.food,
      pos: b.entity?.position,
      username: b.username
    });
  }
});

server.listen(port, () => console.log(`✅ Dashboard: http://localhost:${port}`));
