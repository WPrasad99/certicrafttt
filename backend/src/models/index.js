const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const db = {};

let sequelize;
if (process.env.DATABASE_URL) {
  // Use explicit options to ensure dialectOptions are respected
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      // Keep family: 4 here as a backup for the driver
      family: 4
    },
    // Optimized pool config for Supabase free tier
    pool: {
      max: 2,          // Reduced from 5 - Supabase free tier has low connection limits
      min: 0,
      acquire: 60000,  // Increased from 30000 - give more time to acquire
      idle: 10000
    }
  });
} else if (process.env.DB_HOST) {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'certificate_system',
    process.env.DB_USER || 'macbook',
    process.env.DB_PASSWORD || 'changeme',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        family: 4
      }
    }
  );
} else {
  console.log('No database config found, falling back to SQLite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false
  });
}

// Import models
const modelFiles = ['participant', 'event', 'certificate', 'user', 'template', 'collaborator', 'message', 'activityLog'];
for (const file of modelFiles) {
  const modelContent = require(path.join(__dirname, file));
  const model = modelContent(sequelize);
  db[model.name] = model;
}

// Associations
db.Event.hasMany(db.Participant, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true });
db.Participant.belongsTo(db.Event, { foreignKey: 'eventId' });

db.Event.hasMany(db.Certificate, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true });
db.Certificate.belongsTo(db.Event, { foreignKey: 'eventId' });

db.Participant.hasOne(db.Certificate, { foreignKey: 'participantId', onDelete: 'CASCADE', hooks: true });
db.Certificate.belongsTo(db.Participant, { foreignKey: 'participantId' });

db.Event.hasOne(db.Template, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true });
db.Template.belongsTo(db.Event, { foreignKey: 'eventId' });

// Event and User (Organizer)
db.User.hasMany(db.Event, { foreignKey: 'organizerId' });
db.Event.belongsTo(db.User, { foreignKey: 'organizerId', as: 'Organizer' });

// Collaborator and Event/User
db.Event.hasMany(db.Collaborator, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true });
db.Collaborator.belongsTo(db.Event, { foreignKey: 'eventId' });
db.User.hasMany(db.Collaborator, { foreignKey: 'userId' });
db.Collaborator.belongsTo(db.User, { foreignKey: 'userId' });

// Message and Event/User
db.Event.hasMany(db.Message, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true });
db.Message.belongsTo(db.Event, { foreignKey: 'eventId' });
db.User.hasMany(db.Message, { foreignKey: 'userId' });
db.Message.belongsTo(db.User, { foreignKey: 'userId' });

// Activity Logs
db.Event.hasMany(db.ActivityLog, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true });
db.ActivityLog.belongsTo(db.Event, { foreignKey: 'eventId' });
db.User.hasMany(db.ActivityLog, { foreignKey: 'userId', as: 'Actor' });
db.ActivityLog.belongsTo(db.User, { foreignKey: 'userId', as: 'Actor' });

module.exports = { sequelize, Sequelize, ...db };
