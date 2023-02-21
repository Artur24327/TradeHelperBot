//const signal = require('./index').userSignal
const user = require('../index').user

class userController {
  async createUser(idChat) {
    await user.findOrCreate({
      where: { idchat: idChat },
      logging: false,
    })
  }

  //async getUserId(idChat) {
  // let res
  // await db
  //   .query(`SELECT iduser FROM users WHERE idChat = '${idChat}'`)
  //   .then((result) => {
  //     res = result.rows[0].iduser
  //   })
  //   .catch((err) => console.log(err))
  // return res

  //}

  async deleteUser(idChat) {
    // await db
    //   .query(`DELETE FROM users WHERE idChat = ${idChat}`)
    //   .then((result) => console.log(result.rows[0]))
    await user.destroy({
      where: {
        idchat: idChat,
      },
      logging: false,
    })
  }
}

exports.userController = new userController()
