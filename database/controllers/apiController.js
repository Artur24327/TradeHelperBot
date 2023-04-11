const bot = require('../../bot/main')
//const signal = require('../index').userSignal
//const user = require('../index').user
const user = require('./userController').userController
const apiKey = require('../index').apiKey

class apiController {
  async createAPI(chatId, APIKEY, APISECRET) {
    try {
      const iduser = await user.idUser(chatId)
      await apiKey.create({
        iduser: iduser,
        apikey: APIKEY,
        apisecret: APISECRET,
      })
      bot.botMessage(chatId, 'API added!')
    } catch (err) {
      bot.botMessage(chatId, 'Error in database...')
    }
  }

  async showAPI(chatId) {
    try {
      const iduser = await user.idUser(chatId)

      return await apiKey.findAll({
        where: {
          iduser: iduser,
        },
        logging: false,
      })
    } catch {
      bot.botMessage(chatId, 'Error in database...')
    }
  }

  async deleteAPI(idApi, chatId) {
    try {
      const iduser = await user.idUser(chatId)
      await apiKey.destroy({
        where: {
          idapi: idApi,
          iduser: iduser,
        },
        logging: false,
      })
      bot.botMessage(chatId, 'API deleted!')
    } catch {
      bot.botMessage(chatId, 'Error in database...')
    }
  }
}

exports.apiController = new apiController()
