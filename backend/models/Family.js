const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Family = sequelize.define('Family', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    joinCode: {
      // simple random code to allow inviting members
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'families',
    timestamps: true
  });

  return Family;
};
