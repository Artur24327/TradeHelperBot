const parser = require('./parser/main');
const bot = require('./bot/main');
const cron = require('./database/cron');
// parser.getFutersPrice();
bot.startBot();
cron.cronStart();