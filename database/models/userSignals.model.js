const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define(
    'usersignals',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      iduser: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      symbol: {
        allowNull: false,
        type: DataTypes.CHAR,
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      triggervalue: {
        allowNull: false,
        type: DataTypes.CHAR,
      },
    },
    {
      timestemp: false,
      createdAt: false,
      updatedAt: false,
    }
  )
}
