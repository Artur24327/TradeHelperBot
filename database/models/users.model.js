const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define(
    'users',
    {
      iduser: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      idchat: {
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
