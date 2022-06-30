const db = require('./db')
const bot = require('../bot/main')
class signalController {
  async createSignal(chatId, idUser, symbol, price, triggerValue) {
    await db
      .query(
        `INSERT INTO userSignals (idUser, symbol, price, triggerValue) 
        values (${idUser}, '${symbol}', ${price}, '${triggerValue}')`
      )
      .then(() => bot.botMessage(chatId, 'Signal created!'))
      .catch(() => bot.botMessage(chatId, 'Error in database...'))
  }

  async getAllSignals(chatId) {
    let res
    await db
      .query(
        `SELECT * FROM userSignals WHERE idUser IN (SELECT idUser FROM users WHERE idChat = '${chatId}')`
      )
      .then((result) => {
        res = result.rows
      })
      .catch(() => bot.botMessage(chatId, 'Error in database...'))
    return res
  }

  async getSignalsAllUsers() {
    let res
    // await db.query(`SELECT * FROM userSignals`)
    await db
      .query(
        `SELECT userSignals.symbol, userSignals.price, userSignals.triggervalue, users.idchat as idChat 
        FROM userSignals RIGHT OUTER JOIN users 
        ON userSignals.iduser = users.iduser`
      )
      .then((result) => {
        res = result.rows
      })
      .catch((err) => console.log(err))
    return res
  }

  async deleteSignal(chatId, symbol, price) {
    let res
    await db
      .query(
        `DELETE FROM userSignals WHERE idUser IN (SELECT idUser FROM users
            WHERE idchat = '${chatId}') AND symbol = '${symbol}' AND price = ${price}`
      )
      .then((result) => {
        if (result.rowCount == 1) {
          res = 'Signal deleted!'
        } else if (result.rowCount == 0) {
          res = 'Signal not found!'
        }
      })
      .catch(() => {
        res = 'Smth wrong with database...'
      })
    return res
  }
}

exports.signalController = new signalController()
