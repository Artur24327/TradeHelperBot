const alert = require('../index').regularAlerts
const user = require('./userController').userController
const tableUser = require('../index').user
const bot = require('../../bot/main')

class regularALertsController {
  async updateAlert(chatId, timeframe, text) {
    try {
      const iduser = await user.idUser(chatId)
      const created = await alert.findOrCreate({
        where: { iduser: iduser },
        defaults: {
          [timeframe]: text,
        },
      })
      if (created[1] === false) {
        const res = await alert.update(
          { [timeframe]: text },
          { where: { iduser: iduser } }
        )
        //console.log(res)

        if (res[0] === 0) reject()
      }
      bot.botMessage(chatId, 'Regular alert updated!')
    } catch {
      bot.botMessage(
        chatId,
        'Regular alert do not updated.... Please contact with developer '
      )
    }
  }

  async getAlerts() {
    let alerts = await alert.findAll({ include: tableUser })
    alerts = JSON.parse(JSON.stringify(alerts))
    return alerts
  }
}

exports.regularALertsController = new regularALertsController()
