const { DataTypes } = require('sequelize');
const db = require('../db');
const User = require('./user');

const Habit = db.define('Habit', {
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  telegramUserId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.STRING,
  category: DataTypes.STRING,
  frequency: { 
    type: DataTypes.STRING, 
    defaultValue: 'daily',
    validate: {
      isIn: [['daily', 'weekly', 'monthly']]
    }
  },
  schedule: { 
    type: DataTypes.JSON, 
    defaultValue: null 
  }, // For weekly: ["mon", "wed", "fri"], for monthly: [1, 15, 30], for daily: null
});

const HabitCompletion = db.define('HabitCompletion', {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  indexes: [
    { unique: true, fields: ['HabitId', 'date'] }
  ]
});

User.hasMany(Habit, { foreignKey: 'UserId', onDelete: 'CASCADE' });
Habit.belongsTo(User, { foreignKey: 'UserId' });

Habit.hasMany(HabitCompletion, { onDelete: 'CASCADE' });
HabitCompletion.belongsTo(Habit);

module.exports = { Habit, HabitCompletion };




