const { Sequelize } = require('sequelize')
const usersModel = require('./models/users.model')
const userSignalsModel = require('./models/userSignals.model')
const apiModel = require('./models/api.model')
const sequelize = new Sequelize('traderBot', 'postgres', 'Artur-228', {
  host: 'localhost',
  dialect: 'postgres',
})

const user = usersModel(sequelize)
const userSignal = userSignalsModel(sequelize)
const apiKey = apiModel(sequelize)

userSignal.belongsTo(user, {
  foreignKey: 'iduser',
})

apiKey.belongsTo(user, {
  foreignKey: 'iduser',
})

module.exports.user = user
module.exports.userSignal = userSignal
module.exports.apiKey = apiKey
