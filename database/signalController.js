const bot = require('../bot/main')
const signal = require('./index').userSignal
const user = require('./index').user

class signalController {
  async createSignal(chatId, symbol, price, triggerValue) {
    try {
      const userDate = await user.findOne({
        attributes: ['iduser'],
        where: {
          idchat: chatId,
        },
        logging: false,
      })
      await signal.create({
        iduser: userDate.iduser,
        symbol: symbol,
        price: price,
        triggervalue: triggerValue,
      })
      bot.botMessage(chatId, 'Signal created!')
    } catch {
      bot.botMessage(chatId, 'Error in database...')
    }
  }

  async getAllSignals(chatId) {
    try {
      const userDate = await user.findOne({
        attributes: ['iduser'],
        where: {
          idchat: chatId,
        },
        logging: false,
      })

      return await signal.findAll({
        where: {
          iduser: userDate.iduser,
        },
        logging: false,
      })

      // return await signal.findAll({
      //   include: {
      //     model: user,
      //     where: { iduser: chatId },
      //   },
      //   //logging: false,
      // })
    } catch {
      bot.botMessage(chatId, 'Error in database...')
    }
  }

  async getSignalsAllUsers() {
    try {
      return await signal.findAll({
        attributes: [
          'user.idchat',
          'usersignals.symbol',
          'usersignals.price',
          'usersignals.triggervalue',
        ],
        include: {
          model: user,
        },
        logging: false,
      })
    } catch (err) {
      console.log(err)
    }
  }

  async deleteSignal(chatId, symbol, price) {
    try {
      const userDate = await user.findOne({
        attributes: ['iduser'],
        where: {
          idchat: chatId,
        },
      })

      await signal.destroy({
        where: {
          iduser: userDate.iduser,
          symbol: symbol,
          price: price,
        },
      })

      return 'Signal deleted!'
    } catch (err) {
      bot.botMessage(chatId, 'Error in database...')
      console.log(err)
    }
  }
}

exports.signalController = new signalController()
