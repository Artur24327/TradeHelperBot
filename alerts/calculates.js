const CronJob = require('cron').CronJob
const bdALerts = require('../database/controllers/regularAlertsController').regularALertsController
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

  const usersAtr = {}
  const usersAlerts =  await bdALerts.getAlerts()
  usersAlerts.forEach(element => {
    const atrIncrease = element.timeframe_5.split(' ')[1].split('x')[1]
    const idUser = element.user.idchat
    usersAtr.atrIncrease.push(idchat)
    // console.log(element.user)
    // console.log(element.user.idchat)
   
  })///////////щоб оптимізувати пошук, потрібно стоврити масив об'єктів, де ключ значення атр, а значення масив ідчатів юерів
  console.log(usersAtr)

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

   usersAtr.forEach( element => {
     console.log(element, element[0])
   })
    if (atr(marketData) > atrAllTickers[symbol] * 1.3) {
      console.log(`!!!!!!!!!!ALERT ${symbol}!!!!!!!!!!`)
    }
    
    atrAllTickers[symbol] = atr(marketData)
  }

  console.log(atrAllTickers)
})

exports.jobCalc = jobCalc
