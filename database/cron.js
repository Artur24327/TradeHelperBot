const CronJob = require('cron').CronJob
const bdSignal = require('../database/signalController')
const binance = require('node-binance-api')
const bot = require('../bot/main')
const connect = new binance().options({
  APIKEY: 'dkl5SmAcvSAtzXWi8kCHUojw03Npeghi7A3ErXgVoO7vsNFMpr9BLxevkH6dYUZh',
  APISECRET: 'Q7a91imDhCHNfROw63LaOEm4FnPZqKXljh7GG0DINDAtr9sZ4BK8e59MJhC6d3CR',
})

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
            bot.signalAlert(
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
            bot.signalAlert(
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
