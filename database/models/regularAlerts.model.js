const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define(
    'regularalerts',
    {
      idalert: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      timeframe_5: {
        allowNull: true,
        type: DataTypes.CHAR,
      },
      timeframe_15: {
        allowNull: true,
        type: DataTypes.CHAR,
      },
      timeframe_30: {
        allowNull: true,
        type: DataTypes.CHAR,
      },
      timeframe_60: {
        allowNull: true,
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
