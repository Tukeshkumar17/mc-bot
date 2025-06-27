# 🤖 Minecraft AFK Bot with Dashboard

A robust, feature-rich Minecraft AFK bot with a beautiful web dashboard for monitoring and control.

## ✨ Features

### 🎮 Bot Features
- **Smart Anti-AFK System**: Random movements, jumping, and looking around
- **Auto-Eating**: Automatically eats food when hungry
- **Health Monitoring**: Tracks health and food levels
- **Auto-Respawn**: Automatically respawns when the bot dies
- **Pathfinding**: Advanced movement capabilities
- **PvP Support**: Basic combat functionality
- **Command System**: Responds to in-game commands
- **Auto-Reconnect**: Automatically reconnects when disconnected

### 🌐 Dashboard Features
- **Real-time Monitoring**: Live bot status, health, food, and position
- **Chat Interface**: Send messages to the server from the dashboard
- **Activity Logs**: Track all bot activities and errors
- **Server Information**: Display server details and connection status
- **Remote Control**: Restart bot and send commands remotely
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern, glassmorphism-style interface

### 🛠️ Technical Features
- **Error Handling**: Comprehensive error handling and logging
- **Graceful Shutdown**: Proper cleanup on exit
- **Socket.IO Integration**: Real-time communication between bot and dashboard
- **RESTful API**: HTTP endpoints for bot control
- **Environment Configuration**: Easy setup with .env file
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Minecraft account (for premium servers)

### Installation

1. **Clone or download the files**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Edit the `.env` file with your server details:
   ```env
   MC_HOST=your-server-ip
   MC_PORT=25565
   MC_USERNAME=your-minecraft-username
   MC_PASSWORD=your-minecraft-password
   MC_VERSION=1.20.1
   PORT=3000
   ```

4. **Start the bot**:
   ```bash
   npm start
   ```

5. **Open the dashboard**:
   Visit `http://localhost:3000` in your browser

## 📋 Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `MC_HOST` | ✅ | Minecraft server IP/hostname | - |
| `MC_PORT` | ✅ | Minecraft server port | 25565 |
| `MC_USERNAME` | ✅ | Bot's Minecraft username | - |
| `MC_PASSWORD` | ❌ | Password (for premium accounts) | - |
| `MC_VERSION` | ❌ | Minecraft version | latest |
| `PORT` | ❌ | Dashboard port | 3000 |
| `NODE_ENV` | ❌ | Environment mode | development |

### Server Types

#### Premium Servers (Official Minecraft)
```env
MC_USERNAME=your-email@gmail.com
MC_PASSWORD=your-password
```

#### Cracked Servers
```env
MC_USERNAME=your-username
# Leave MC_PASSWORD empty or remove it
```

## 🎮 In-Game Commands

The bot responds to these commands in chat:

- `!ping` - Check if bot is active
- `!pos` - Get bot's current position
- `!health` - Check bot's health and food levels
- `!time` - Get current in-game time

## 🌐 Dashboard Usage

### Main Features

1. **Bot Status**: Real-time status indicator showing online/offline/reconnecting
2. **Statistics**: Health, food, uptime, and position tracking
3. **Chat Interface**: Send messages directly to the server
4. **Control Panel**: Restart bot and send quick commands
5. **Activity Logs**: Monitor all bot activities and errors

### API Endpoints

- `GET /api/status` - Get bot status
- `POST /api/chat` - Send chat message
- `POST /api/restart` - Restart bot

## 🔧 Troubleshooting

### Common Issues

#### Bot won't connect
- Check server IP and port
- Verify username and password
- Ensure server is online
- Check firewall settings

#### Authentication errors
- For premium servers: Use email and password
- For cracked servers: Use username only (no password)
- Verify Microsoft account credentials

#### Dashboard not loading
- Check if port 3000 is available
- Try accessing via `http://localhost:3000`
- Check console for errors

#### Bot keeps disconnecting
- Check internet connection
- Verify server stability
- Review bot logs for error messages

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📁 Project Structure

```
minecraft-afk-bot/
├── bot.js              # Main bot logic
├── server.js           # Web server and dashboard
├── package.json        # Dependencies and scripts
├── .env               # Environment configuration
├── README.md          # This file
└── dashboard/
    └── views/
        └── index.ejs  # Dashboard HTML template
```

## 🛡️ Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for premium accounts
- Consider using environment variables in production
- Regularly update dependencies for security patches

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This bot is for educational purposes. Ensure you comply with your server's rules and Minecraft's Terms of Service. Use responsibly and respect server guidelines.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review the console logs
3. Ensure all dependencies are installed
4. Verify your configuration

## 🔮 Future Features

- [ ] Multiple bot support
- [ ] Advanced pathfinding
- [ ] Inventory management
- [ ] Scheduled tasks
- [ ] Plugin system
- [ ] Mobile app
- [ ] Discord integration
- [ ] Database logging

---

**Happy botting! 🎮**
