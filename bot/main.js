const TelegramApi = require('node-telegram-bot-api')
const parser = require('../parser/main')
const bd = require('../database/userController')
const tokenBot = '5169311848:AAHM85DS_v1So_dm5v5P-_EGYtorYBGg5Mc'
const bot = new TelegramApi(tokenBot, { polling: true })

const firstMessage = `
Hello my dear trader! I am going to do your trades faster and eazier.
Write /info to get options what bot can.`

const descriptionMessages = `
/create_signal (option) - creat sound-message signal for ticker
/show_active (option) - get the info about TOP10 more active tickers
/show_volume (option) - get the info about TOP10 volume tickers
/menu - to show all options`

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
  bot.setMyCommands([
    { command: '/info', description: 'To get info of commands' },
    { command: '/menu', description: 'Show all options' },
  ])

  ///Прослуховувач на меню - плитку
  bot.on('message', (message) => {
    const userMessage = message.text
    const chatId = message.chat.id
    switch (userMessage) {
      case '/start':
        bot.sendMessage(chatId, firstMessage)
        bd.userController.createUser(chatId)
        break
      case '/info':
        bot.sendMessage(chatId, descriptionMessages)
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

    switch (data) {
      case '/create_signal':
        bot.sendMessage(
          chatId,
          'Write ticker(example: "/create_signal btcusdt 200" ):'
        )
        break
      case '/show_signal':
        parser.showSignals(chatId)
        break
      case '/show_active':
        parser.getTopActive(chatId)
        break
      case '/show_volume':
        parser.getTopVolume(chatId)
        break
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

// function signalAlert(idChat, message) {
//   bot.sendMessage(idChat, message)
// }

exports.startBotListeners = startBotListeners
exports.botMessage = botMessage
//exports.signalAlert = signalAlert
