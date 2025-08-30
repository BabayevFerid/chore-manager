const { Sequelize } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL || `sqlite:${path.join(__dirname, 'data', 'database.sqlite')}`;

// Create directory for sqlite file if not present
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const sequelize = new Sequelize(databaseUrl, {
  logging: false, // set to console.log to debug SQL
  dialectOptions: {
    // SQLite specific options can go here
  }
});

// Import models and associate
const User = require('./models/User')(sequelize);
const Family = require('./models/Family')(sequelize);
const Chore = require('./models/Chore')(sequelize);

// Associations
Family.hasMany(User, { foreignKey: 'familyId', as: 'members', onDelete: 'CASCADE' });
User.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });

Family.hasMany(Chore, { foreignKey: 'familyId', as: 'chores', onDelete: 'CASCADE' });
Chore.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });

User.hasMany(Chore, { foreignKey: 'assignedToId', as: 'assignedChores' });
Chore.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignee' });

module.exports = {
  sequelize,
  User,
  Family,
  Chore
};
