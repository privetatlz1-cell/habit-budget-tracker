const { DataTypes } = require('sequelize');
const db = require('../db');
const User = require('./user');

const BudgetItem = db.define('BudgetItem', {
  UserId: { type: DataTypes.INTEGER, allowNull: true },
  telegramUserId: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  category: DataTypes.STRING,
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  description: DataTypes.STRING,
});

User.hasMany(BudgetItem, { foreignKey: 'UserId', onDelete: 'CASCADE' });
BudgetItem.belongsTo(User, { foreignKey: 'UserId' });

module.exports = { BudgetItem };






