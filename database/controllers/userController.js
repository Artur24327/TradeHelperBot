//const signal = require('./index').userSignal
const user = require('../index').user

class userController {
  async createUser(idChat) {
    await user.findOrCreate({
      where: { idchat: idChat },
      logging: false,
    })
  }

  async deleteUser(idChat) {
    await user.destroy({
      where: {
        idchat: idChat,
      },
      logging: false,
    })
  }

  async idUser(idChat) {
    const userData = await user.findOne({
      attributes: ['iduser'],
      where: {
        idchat: idChat,
      },
      logging: false,
    })
    return userData.iduser
  }
}

exports.userController = new userController()
