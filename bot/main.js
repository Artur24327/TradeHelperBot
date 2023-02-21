const TelegramApi = require('node-telegram-bot-api')
const parser = require('../parser/main')
const bd = require('../database/controllers/userController')
require('dotenv').config()
/* eslint-disable */
const tokenBot = process.env.TOKEN_BOT
/* eslint-enable */
const bot = new TelegramApi(tokenBot, { polling: true })

const firstMessage = `
Hello my dear trader! I am going to do your trades faster and eazier.
Write /menu to get options what bot can.`


const commands = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: 'Create signal', callback_data: '/create_signal' },
        { text: 'Show my signals', callback_data: '/show_signal' },
      ],
      [
        { text: 'Show TOP volume', callback_data: '/show_volume' },
        { text: 'Show TOP active', callback_data: '/show_active' },
      ],
    ],
  }),
}

function menuBot(chatId) {
  bot.sendMessage(chatId, 'Choose option:', commands)
}

function startBotListeners() {
  bot.on("polling_error", console.log);

  bot.setMyCommands([
    { command: '/menu', description: 'Show all options' },
  ])

  ///Прослуховувач на меню
  bot.on('message', (message) => {
    const userMessage = message.text
    const chatId = message.chat.id
    switch (userMessage) {
      case '/start':
        bot.sendMessage(chatId, firstMessage)
        bd.userController.createUser(chatId)
        break
      case '/menu':
        menuBot(chatId)
        break
    }
  })
  
  ///Прослуховувач на меню - плитку
  bot.on('callback_query', (message) => {
    const data = message.data
    const chatId = message.message.chat.id
    const messageId = message.message.message_id
    switch (data) {
      case '/create_signal':
        bot.sendMessage(
          chatId,
          'Write ticker(example: /create_signal btcusdt 200 ):'
        )
        break
      case '/show_signal':
        parser.showSignals(chatId)
        bot.deleteMessage(chatId, messageId)
        break
      case '/show_active':
        parser.getTopActive(chatId)
        bot.deleteMessage(chatId, messageId)
        break
      case '/show_volume':
        parser.getTopVolume(chatId)
        bot.deleteMessage(chatId, messageId)
        break
      default:
        
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

  ///Прослуховувач на видалення сигналів
  bot.onText(/\/delete_signal (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    //id = chatId
    const resp = match[1].split(' ')
    const ticker = resp[0].toUpperCase()
    const price = resp[1]
    parser.deleteSignal(ticker, price, chatId)
  })

  // commandBot(tokenBot);
}

function botMessage(chatId, message) {
  bot.sendMessage(chatId, message)
}

exports.startBotListeners = startBotListeners
exports.botMessage = botMessage
