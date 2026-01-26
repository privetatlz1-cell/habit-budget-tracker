const { DataTypes } = require('sequelize');
const db = require('../db');
const User = require('./user');

/**
 * DailyNote Model
 * Stores daily notes linked by date only (no time required)
 */
const DailyNote = db.define('DailyNote', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  }
}, {
  indexes: [
    { unique: true, fields: ['telegramUserId', 'date'] }
  ]
});

User.hasMany(DailyNote, { foreignKey: 'UserId', onDelete: 'CASCADE' });
DailyNote.belongsTo(User, { foreignKey: 'UserId' });

module.exports = DailyNote;


