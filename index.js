const bot = require('./bot/main')
const cron = require('./database/cron')
// parser.getFutersPrice();
bot.startBotListeners()
cron.cronStart()
