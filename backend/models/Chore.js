const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chore = sequelize.define('Chore', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    frequency: {
      type: DataTypes.ENUM('once', 'daily', 'weekly', 'monthly'),
      defaultValue: 'once'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'done'),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'chores',
    timestamps: true
  });

  return Chore;
};
