const { DataTypes } = require('sequelize');
const db = require('../db');
const User = require('./user');

const SleepEntry = db.define('SleepEntry', {
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  telegramUserId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: { 
    type: DataTypes.DATEONLY, 
    allowNull: false
  },
  hours: { 
    type: DataTypes.FLOAT, 
    allowNull: false,
    validate: {
      min: 0,
      max: 24
    }
  }
}, {
  indexes: [
    { unique: true, fields: ['telegramUserId', 'date'] }
  ]
});

User.hasMany(SleepEntry, { foreignKey: 'UserId', onDelete: 'CASCADE' });
SleepEntry.belongsTo(User, { foreignKey: 'UserId' });

module.exports = SleepEntry;


