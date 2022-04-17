const parser = require('./parser/main');
const bot = require('./bot/main');
const serverDB = require('./database/server');

// parser.getFutersPrice();
bot.startBot();
serverDB.startServer();