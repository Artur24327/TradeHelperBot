const CronJob = require('cron').CronJob
const bdALerts =
  require('../database/controllers/regularAlertsController').regularALertsController
const binance = require('node-binance-api')
const bot = require('../bot/main')
const atr = require('./indicators/ATR').calculatingATR
require('dotenv').config()

/* eslint-disable */
const connect = new binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.APE_SECRET,
})
/* eslint-enable */

const atrAllTickers = []
const timePeriod = 15

const jobCalc = new CronJob(' */5 * * * *', async function () {
  console.log(1)
  const tickersPrice = await connect.futuresPrices()

  //const usersAtr = {}
  const usersAlerts = await bdALerts.getAlerts()

  const usersAtr = usersAlerts.reduce((accumulator, element) => {
    const atrIncrease = element.timeframe_5.split(' ')[1].split('x')[1]
    const idChat = element.user.idchat
    if (accumulator[atrIncrease]) {
      accumulator[atrIncrease].push(idChat)
    } else {
      accumulator[atrIncrease] = [idChat]
    }
    return accumulator
  }, {})

  for (let symbol in tickersPrice) {
    const marketData = {
      high: [],
      low: [],
      close: [],
      //period: 15,
    }

    let result = await connect.futuresCandles(symbol, '5m')
    result = result.slice(-timePeriod)

    result.forEach((element, i) => {
      marketData.high[i] = +element[2]
      marketData.low[i] = +element[3]
      marketData.close[i] = +element[4]
    })

    for (atrValue in usersAlerts) {
      if (atr(marketData) > atrAllTickers[symbol] * atrValue) {
        usersAlerts.atrValue.forEach((chatId) => {
          bot.botMessage(chatId, `${symbol} is more active then usual`)
        })
      }
    }
    // if (atr(marketData) > atrAllTickers[symbol] * 1.3) {
    //   console.log(`!!!!!!!!!!ALERT ${symbol}!!!!!!!!!!`)
    // }

    atrAllTickers[symbol] = atr(marketData)
  }

  console.log(atrAllTickers)
})

exports.jobCalc = jobCalc
