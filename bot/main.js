const TelegramApi = require('node-telegram-bot-api')
const parser = require('../parser/main')

const regularALertParser = require('../parser/regularAlerts').regularAlert

const bd = require('../database/controllers/userController')
const states = require('../user-state.enum')
require('dotenv').config()

/* eslint-disable */
const tokenBot = process.env.TOKEN_BOT
/* eslint-enable */
const bot = new TelegramApi(tokenBot, { polling: true })

const firstMessage = `
Hello my dear trader! I am going to do your trades faster and eazier`

const instructionsLegularAlerts = `Simple instructions about regular alerts. 
If you want to CREATE/ACTIVATE regular alert, you need to write: (/regular_alert timeframe_x1 atr_x2 volume_x3)`

const menuCommands = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: 'Set regular alerts 🚨' }],
      [{ text: 'Create alert 📝' }, { text: 'Show my alerts 📑' }],
      [{ text: 'Show TOP volume 📊' }, { text: 'Show TOP active 📈' }],
      [{ text: 'API keys 🔑' }],
    ],
  }),
}

const alertCommands = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: 'Add regular alert' }, { text: 'Show regular alerts' }],
      [{ text: 'Back to menu ⬅' }],
    ],
  }),
}

const apiCommands = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: 'Add API' }, { text: 'Show my API' }],
      [{ text: 'Back to menu ⬅' }],
    ],
  }),
}

let stateMap = new Map()
let stateApi = new Map()

async function startBotListeners() {
  ///Прослуховувач на меню
  bot.on('message', (message) => {
    //console.log(message.text)
    //console.log(bot.lis())и чисто н
    const userMessage = message.text
    const chatId = message.chat.id

    //////////////////////
    if (
      userMessage.length == 64 &&
      stateMap.get(chatId) === states.WAITING_APIKEY
    ) {
      addApiKey(chatId, userMessage)
      //secondApiTrigger = true
      bot.sendMessage(chatId, 'Write API secret:')
      stateMap.set(chatId, states.WAITING_SECRETKEY)
    } else if (
      userMessage.length == 64 &&
      stateMap.get(chatId) === states.WAITING_SECRETKEY
    ) {
      addApiKey(chatId, userMessage)
    } else {
      stateMap.delete(chatId)
      stateApi.delete(chatId)
    }
    //////////////////////

    if (userMessage === '/start') {
      bot.sendMessage(chatId, firstMessage, menuCommands)
      bd.userController.createUser(chatId)
    } else {
      switch (userMessage) {
        case 'Create alert 📝':
          bot.sendMessage(
            chatId,
            'Write ticker(example: /create_signal btcusdt 200 ):'
          )
          return
        case 'Set regular alerts 🚨':
          bot.sendMessage(chatId, instructionsLegularAlerts)
          return
        case 'Show my alerts 📑':
          parser.showSignals(chatId)
          //bot.deleteMessage(chatId, messageId)
          return
        case 'Show TOP active 📈':
          parser.getTopActive(chatId)
          //bot.deleteMessage(chatId, messageId)
          return
        case 'Show TOP volume 📊':
          parser.getTopVolume(chatId)
          //bot.deleteMessage(chatId, messageId)
          return
        case 'API keys 🔑':
          bot.sendMessage(chatId, 'API', apiCommands)
          //bot.deleteMessage(chatId, messageId)
          return
        case 'Back to menu ⬅':
          bot.sendMessage(chatId, 'Menu', menuCommands)
          stateMap.set(chatId, states.WAITING_APIKEY)
          return
        case 'Add API':
          bot.sendMessage(chatId, 'Write API key:')
          stateMap.set(chatId, states.WAITING_APIKEY)
          return
        case 'Show my API':
          parser.showApi(chatId)
          return
      }
    }
  })

  bot.on('callback_query', (message) => {
    const data = message.data
    const chatId = message.message.chat.id

    const str = data.split('-')
    const command = str[0]
    const kindOfData = str[1]
    //const ticker = str[2]
    //const price = str[3]
    if (command == 'Delete') {
      if (kindOfData == 'Signal') {
        const ticker = str[2]
        const price = str[3]
        parser.deleteSignal(ticker, price, chatId)
      } else if (kindOfData == 'API') {
        const idApi = str[2]
        parser.deleteApi(idApi, chatId)
      }
    }
  })

  ///Прослуховувач на створення сигналів
  bot.onText(/\/create_signal (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const resp = match[1].split(' ')
    const ticker = resp[0].toUpperCase()
    const price = resp[1]
    parser.createSignal(ticker, price, chatId)
  })

  bot.onText(/\/regular_alert (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const text = match[1].split(' ')
    const timeframe = text[0].toLowerCase()
    regularALertParser.synchronizeAlert(chatId, timeframe, match[1])
    //parser.createSignal(ticker, price, chatId)
  })
}

function addApiKey(chatId, msg) {
  if (stateMap.get(chatId) === states.WAITING_APIKEY) {
    stateApi.set(chatId, msg)
  }
  if (stateMap.get(chatId) === states.WAITING_SECRETKEY) {
    const apiKey = stateApi.get(chatId)
    const apiSecret = msg
    parser.addApi(chatId, apiKey, apiSecret)
    stateMap.delete(chatId)
    stateApi.delete(chatId)
  }
}

function generateTile(chatId, result, text) {
  const commands = {
    reply_markup: JSON.stringify({
      inline_keyboard: result,
    }),
  }
  bot.sendMessage(chatId, text, commands)
}

function botMessage(chatId, message) {
  bot.sendMessage(chatId, message)
}

exports.startBotListeners = startBotListeners
exports.botMessage = botMessage
exports.generateTile = generateTile
