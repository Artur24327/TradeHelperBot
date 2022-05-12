const bot = require('../bot/main')
const bdSignal = require('../database/signalController')
const bdUser = require('../database/userController')
const binance = require('node-binance-api')
const keys = require('../config')
const connect = new binance().options({
  APIKEY: keys.MyApiKeys.apiKey,
  APISECRET: keys.MyApiKeys.apiSecret,
})

function getTopActive() {
  new Promise((resolve) => {
    let resultObj = []
    let result = ''

    connect.prevDay(false, (error, prevDay) => {
      prevDay.forEach((element) => {
        //Фільтрація непотрібних монет
        const symbol = element.symbol
        if (symbol.match(/^((?!UP|DOWN).)*USDT$/) != null) {
          element.priceChangePercent =
            Math.floor(element.priceChangePercent * 100) / 100
          resultObj.push(element)
        }
      })
      resultObj.sort(sortByField('priceChangePercent'))
      resultObj.slice(0, 10).forEach((element, i) => {
        result += `${i+1}. ${element.symbol} +${element.priceChangePercent}%\n`
      })
      resolve(result)
    })
  })
    .then((result) => bot.botMessage(result))
    .catch((err) => bot.botMessage(err))
}

function getTopVolume() {
  new Promise((resolve) => {
    let resultObj = []
    let result = ''

    connect.prevDay(false, (error, prevDay) => {
      prevDay.forEach((element) => {
        //Фільтрація непотрібних монет
        let symbol = element.symbol
        if (symbol.match(/^((?!UP|DOWN).)*USDT$/) != null) {
          element.volume =
            Math.floor((element.volume * element.lastPrice * 1) / 1000) / 1000
          resultObj.push(element)
        }
      })
      resultObj.sort(sortByField('volume'))
      resultObj.slice(0, 10).forEach((element, i) => {
        result += `${i+1}. ${element.symbol} ${element.volume}M$\n`
      })
      resolve(result)
    })
  })
    .then((result) => bot.botMessage(result))
    .catch((err) => bot.botMessage(err))
}

async function createSignal(ticker, price, chatId) {

  ////////потрібно дістати ід юзера з бд
  const idUser = await bdUser.userController.getUserId(chatId)

  new Promise((resolve, reject) => {
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
      if(trigger === 'empty') reject()
      resolve({ idUser, ticker, price, trigger })
    })
  })
    .then(({ idUser, ticker, price, trigger }) => {
      bdSignal.signalController.createSignal(idUser, ticker, price, trigger)
    })
    .catch(() => bot.botMessage('Bad enter! Repeat.'))
}

async function showSignals(chatId) {
  const query = await bdSignal.signalController.getAllSignals(chatId)
  let result =
    `You can delete signals. Write "/delete_signal *ticker* *price*"  
    (For example "/delete_signal btcusdt 4000").\n \nYour signals:\n`
  query.forEach((element) => {
    result += element.symbol + ' ' + element.price + '\n'
  })
  bot.botMessage(result)
}

async function deleteSignal(ticker, price, chatId) {
  const query = await bdSignal.signalController.deleteSignal(
    chatId,
    ticker,
    price
  )
  bot.botMessage(query)
}

function sortByField(field) {
  return (a, b) => (a[field] > b[field] ? -1 : 1)
}

exports.getTopActive = getTopActive
exports.getTopVolume = getTopVolume
exports.createSignal = createSignal
exports.showSignals = showSignals
exports.deleteSignal = deleteSignal
