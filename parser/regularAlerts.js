const bot = require('../bot/main')
const bdSignal = require('../database/controllers/signalController')
const binance = require('node-binance-api')
const bdAlert =
  require('../database/controllers/regularAlertsController').regularALertsController
//const { regularALertsController } = require('../database/controllers/regularAlertsController')
require('dotenv').config()

/* eslint-disable */
const connect = new binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.APE_SECRET,
})
/* eslint-enable */

class regularAlert {
  synchronizeAlert(chatId, timeframe, text) {
    bdAlert.updateAlert(chatId, timeframe, text)
  }
}

exports.regularAlert = new regularAlert()
