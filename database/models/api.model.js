const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define(
    'apikeys',
    {
      idapi: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      apikey: {
        allowNull: false,
        type: DataTypes.CHAR,
      },
      apisecret: {
        allowNull: false,
        type: DataTypes.CHAR,
      },
      iduser: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      timestemp: false,
      createdAt: false,
      updatedAt: false,
    }
  )
}
