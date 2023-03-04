const bot = require('../bot/main')
const bdSignal = require('../database/controllers/signalController')
const binance = require('node-binance-api')

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
        result += `${i + 1}. ${element.symbol} +${
          element.priceChangePercent
        }%\n`
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
      element.priceChangePercent =
        '+' + element.priceChangePercent.toFixed(1) + '%'
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

  // resultObj.slice(0, 10).forEach((element, i) => {
  //   if (element.volume < BILLION) {
  //     element.volume = `${(element.volume / MILLION).toFixed(3)} M$`
  //   } else {
  //     element.volume = `${(element.volume / BILLION).toFixed(3)} B$`
  //   }
  //   element.priceChangePercent = '+' + element.priceChangePercent.toFixed(1) + '%'

  //   if(typeOfData == 'Active'){
  //     result += `\n${i + 1}. ${element.symbol} ${element.priceChangePercent}`
  //   }else if(typeOfData == 'Volume'){
  //     result += `\n${i + 1}. ${element.symbol} ${element.volume}`
  //   }
  // })

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
        if (symbol.match(/^((?!UP|DOWN).)*USDT$/) != null 
        || symbol.match(/^((?!UP|DOWN).)*BUSD$/) != null) {
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
      if (trigger === 'empty') reject()
      resolve({ chatId, ticker, price, trigger })
    })
  })
    .then(({ chatId, ticker, price, trigger }) => {
      bdSignal.signalController.createSignal(chatId, ticker, price, trigger)
    })
    .catch(() => bot.botMessage('Bad enter! Repeat.'))
}

async function showSignals(chatId) {
  const query = await bdSignal.signalController.getAllSignals(chatId)
  // let result = `You can delete signals. Write "/delete_signal *ticker* *price*"
  //   (For example "/delete_signal btcusdt 4000").\n \nYour signals:\n`
  let result = []

  query.forEach((element) => {
    let obj = {}
    let arr = []
    obj.text =
      'Delete ' + element.symbol + ' on ' + element.price + '    ' + '❌'
    obj.callback_data = 'Delete-' + element.symbol + '-' + element.price
    arr.push(obj)
    result.push(arr)
    //result += i+1 + '.' + element.symbol + ' ' + element.price + ' ' + element.triggervalue +'\n'
  })

  //bot.botMessage(chatId, result)
  bot.generateTile(chatId, result, 'Your signals:')
}

async function deleteSignal(ticker, price, chatId) {
  const query = await bdSignal.signalController.deleteSignal(
    chatId,
    ticker,
    price
  )
  bot.botMessage(chatId, query)
  showSignals(chatId)
}

function sortByField(field) {
  return (a, b) => (a[field] > b[field] ? -1 : 1)
}

exports.getTopActive = getTopActive
exports.getTopVolume = getTopVolume
exports.createSignal = createSignal
exports.showSignals = showSignals
exports.deleteSignal = deleteSignal
