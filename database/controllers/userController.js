const user = require('../index').user

class userController {
  async createUser(idChat) {
    await user.findOrCreate({
      where: { idchat: idChat },
    })
  }

  async deleteUser(idChat) {
    await user.destroy({
      where: {
        idchat: idChat,
      },
    })
  }

  async idUser(idChat) {
    const userData = await user.findOne({
      attributes: ['iduser'],
      where: {
        idchat: idChat,
      },
    })
    return userData.iduser
  }
}

exports.userController = new userController()
