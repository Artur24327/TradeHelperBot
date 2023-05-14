const bot = require('../bot/main')
const bdSignal = require('../database/controllers/signalController')
const binance = require('node-binance-api')
const bdApi = require('../database/controllers/apiController').apiController
require('dotenv').config()

/* eslint-disable */
const connect = new binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.APE_SECRET,
})
/* eslint-enable */
const BILLION = 1000000000
const MILLION = 1000000

function getTopActive(chatId) {
  new Promise((resolve) => {
    let resultObj = []
    let result = 'Spot TOP\n'

    connect.prevDay(false, (error, prevDay) => {
      prevDay.forEach((element) => {
        //Фільтрація непотрібних монет
        const symbol = element.symbol
        if (symbol.match(/^((?!UP|DOWN).)*USDT$/) != null) {
          // element.priceChangePercent =
          //   Math.floor(element.priceChangePercent * 100) / 100
          element.priceChangePercent = (+element.priceChangePercent).toFixed(1)
          resultObj.push(element)
        }
      })
      resultObj.sort(sortByField('priceChangePercent'))
      resultObj.slice(0, 10).forEach((element, i) => {
        result += `${i + 1}. ${element.symbol} ${element.priceChangePercent}%\n`
      })
      resolve({ chatId, result })
    })
  })
    .then(({ chatId, result }) => {
      bot.botMessage(chatId, result)
      futuresData(chatId, 'Active')
    })
    .catch((err) => bot.botMessage(chatId, err))
}

async function futuresData(chatId, typeOfData) {
  //console.log( await connect.futuresCandles( "BTCUSDT", "1M" ) );
  let futures = await connect.futuresDaily()
  let resultObj = []
  let result = 'Futures TOP'

  for (let element in futures) {
    let helpObj = {}
    helpObj.symbol = futures[element].symbol + 'PERP'
    helpObj.priceChangePercent = +futures[element].priceChangePercent
    helpObj.priceChangePercent = +helpObj.priceChangePercent.toFixed(1)
    helpObj.volume = +futures[element].volume * +futures[element].lastPrice
    resultObj.push(helpObj)
  }

  if (typeOfData == 'Active') {
    resultObj.sort(sortByField('priceChangePercent'))
    resultObj.slice(0, 10).forEach((element, i) => {
      element.priceChangePercent = element.priceChangePercent.toFixed(1) + '%'
      result += `\n${i + 1}. ${element.symbol} ${element.priceChangePercent}`
    })
  } else if (typeOfData == 'Volume') {
    resultObj.sort(sortByField('volume'))
    resultObj.slice(0, 10).forEach((element, i) => {
      if (element.volume < BILLION) {
        element.volume = `${(element.volume / MILLION).toFixed(3)} M$`
      } else {
        element.volume = `${(element.volume / BILLION).toFixed(3)} B$`
      }
      result += `\n${i + 1}. ${element.symbol} ${element.volume}`
    })
  }

  bot.botMessage(chatId, result)
}

function getTopVolume(chatId) {
  new Promise((resolve) => {
    let resultObj = []
    let result = 'Spot TOP\n'

    connect.prevDay(false, (error, prevDay) => {
      prevDay.forEach((element) => {
        //Фільтрація непотрібних монет
        let symbol = element.symbol
        if (
          symbol.match(/^((?!UP|DOWN).)*USDT$/) != null ||
          symbol.match(/^((?!UP|DOWN).)*BUSD$/) != null
        ) {
          element.volume =
            Math.floor((element.volume * element.lastPrice * 1) / 1000) / 1000
          resultObj.push(element)
        }
      })
      resultObj.sort(sortByField('volume'))
      resultObj.slice(0, 10).forEach((element, i) => {
        if (element.volume < 1000) {
          result += `${i + 1}. ${element.symbol} ${element.volume} M$\n`
        } else {
          result += `${i + 1}. ${element.symbol} ${(
            element.volume / 1000
          ).toFixed(3)} B$\n`
        }
      })
      resolve({ chatId, result })
    })
  })
    .then(({ chatId, result }) => {
      bot.botMessage(chatId, result)
      futuresData(chatId, 'Volume')
    })
    .catch((err) => bot.botMessage(chatId, err))
}

async function createSignal(ticker, price, chatId) {
  ////////потрібно дістати ід юзера з бд
  //const idUser = await bdUser.userController.getUserId(chatId)
  try {
    const trigger = await new Promise((resolve, reject) => {
      ///перевіряємо чи введена ціна число
      if (isNaN(+price)) reject()

      let symbolObj = {}
      let trigger = 'empty'

      //////api binance
      connect.prevDay(false, (error, prevDay) => {
        prevDay.forEach((element) => {
          symbolObj[element.symbol] = element.lastPrice
        })

        /////trigger for signal
        for (let key in symbolObj) {
          if (key == ticker) {
            if (+symbolObj[key] > price) {
              trigger = '<'
            } else if (+symbolObj[key] < price) {
              trigger = '>'
            }
            break
          }
        }

        ///якщо трішер був не встановлений, значить не існує такої монетки
        if (trigger === 'empty') reject()
        resolve(trigger)
      })
    })
    bdSignal.signalController.createSignal(chatId, ticker, price, trigger)
  } catch (err) {
    bot.botMessage(chatId, 'Bad enter! Repeat.')
  }
}

async function showSignals(chatId) {
  const query = await bdSignal.signalController.getAllSignals(chatId)
  let result = []

  query.forEach((element) => {
    let obj = {}
    let arr = []
    obj.text =
      'Delete ' + element.symbol + ' on ' + element.price + '    ' + '❌'
    obj.callback_data = `Delete-Signal-${element.symbol}-${element.price}`
    arr.push(obj)
    result.push(arr)
    console.log(arr)
    //result += i+1 + '.' + element.symbol + ' ' + element.price + ' ' + element.triggervalue +'\n'
  })
  //bot.botMessage(chatId, result)
  bot.generateTile(chatId, result, 'Your signals:')
}

async function deleteSignal(ticker, price, chatId) {
  await bdSignal.signalController.deleteSignal(chatId, ticker, price)
  //bot.botMessage(chatId, query)
  showSignals(chatId)
}

function sortByField(field) {
  return (a, b) => (a[field] > b[field] ? -1 : 1)
}

async function showApi(chatId) {
  let result = []
  const query = await bdApi.showAPI(chatId)
  query.forEach((element) => {
    let obj = {}
    let arr = []
    obj.text = `********${element.dataValues.apikey.slice(55)} ❌`
    obj.callback_data = `Delete-API-${element.dataValues.idapi}`
    arr.push(obj)
    result.push(arr)
  })
  bot.generateTile(chatId, result, 'Your API:')
}

async function deleteApi(idApi, chatId) {
  await bdApi.deleteAPI(idApi, chatId)
  //bot.botMessage(chatId, query)
  showApi(chatId)
}

async function addApi(chatId, apiKey, apiSecret) {
  const testConnection = new binance().options({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    //useServerTime: true,
    //recvWindow: 60000,
  })
  //await testConnection.useServerTime();
  testConnection.balance((error, balances) => {
    //if ( error ) return console.error(error);
    if (typeof balances.ETH === 'undefined') {
      return bot.botMessage(chatId, 'Wrong keys! Try again.')
    } else {
      bdApi.createAPI(chatId, apiKey, apiSecret)
    }
  })
}

exports.getTopActive = getTopActive
exports.getTopVolume = getTopVolume
exports.createSignal = createSignal
exports.showSignals = showSignals
exports.deleteSignal = deleteSignal
exports.showApi = showApi
exports.deleteApi = deleteApi
exports.addApi = addApi
