const bot = require('../../bot/main')
const signal = require('../index').userSignal
const userConnect = require('../index').user
const user = require('./userController').userController

class signalController {
  async createSignal(chatId, symbol, price, triggerValue) {
    try {
      const iduser = await user.idUser(chatId)
      await signal.create({
        iduser: iduser,
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
      const iduser = await user.idUser(chatId)
      return await signal.findAll({
        where: {
          iduser: iduser,
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
          model: userConnect,
        },
        logging: false,
      })
    } catch (err) {
      console.log(err)
    }
  }

  async deleteSignal(chatId, symbol, price) {
    try {
      const iduser = await user.idUser(chatId)
      await signal.destroy({
        where: {
          iduser: iduser,
          symbol: symbol,
          price: price,
        },
      })
      bot.botMessage(chatId, 'Signal deleted!')
    } catch (err) {
      bot.botMessage(chatId, 'Error in database...')
      console.log(err)
    }
  }
}

exports.signalController = new signalController()
