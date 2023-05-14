const bot = require('./bot/main')
const cronDB = require('./database/cron').jobDB
const cronCalc = require('./alerts/calculates').jobCalc
// parser.getFutersPrice();
bot.startBotListeners()
cronDB.start()
cronCalc.start()
