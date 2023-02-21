const CronJob = require('cron').CronJob
const bdSignal = require('./controllers/signalController')
const binance = require('node-binance-api')
const bot = require('../bot/main')
require('dotenv').config()

/* eslint-disable */
const connect = new binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.APE_SECRET,
})
/* eslint-enable */

function cronStart() {
  let job = new CronJob('*/7 * * * * *', async function () {
    const dbSignals = await bdSignal.signalController.getSignalsAllUsers()
    let binanceTickers = {}
    // console.log(dbSignals);
    connect.prevDay(false, (error, prevDay) => {
      prevDay.forEach((element) => {
        dbSignals.forEach((elementDB) => {
          if (elementDB.symbol == element.symbol) {
            binanceTickers[element.symbol] = element.lastPrice
          }
        })
      })

      dbSignals.forEach((element) => {
        if (element.triggervalue == '>') {
          if (binanceTickers[element.symbol] > element.price) {
            bot.botMessage(
              element.idchat,
              `Signal ${element.symbol} on price ${element.price}`
            )
            bdSignal.signalController.deleteSignal(
              element.idchat,
              element.symbol,
              element.price
            )
          }
        } else if (element.triggervalue == '<') {
          if (binanceTickers[element.symbol] < element.price) {
            bot.botMessage(
              element.idchat,
              `Signal ${element.symbol} on price ${element.price}`
            )
            bdSignal.signalController.deleteSignal(
              element.idchat,
              element.symbol,
              element.price
            )
          }
        }
      })
    })
  })

  job.start()
}

exports.cronStart = cronStart
