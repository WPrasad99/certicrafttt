const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const db = {};

let sequelize;
if (process.env.DATABASE_URL) {
  // Production: Supabase connection via pooler (port 6543)
  // NOTE: rejectUnauthorized:false is required for Supabase's PgBouncer pooler which uses
  // a self-signed cert. If you switch to direct connection (port 5432), set this to true.
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Supabase pooler — acceptable trade-off
      },
      family: 4
    },
    pool: {
      max: 5,          // Increased — Supabase free tier allows more if using pooler
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else if (process.env.DB_HOST) {
  // Require all DB credentials from environment — no insecure defaults
  if (!process.env.DB_PASSWORD || !process.env.DB_USER || !process.env.DB_NAME) {
    console.error('[FATAL] DB_HOST set but DB_USER, DB_PASSWORD, or DB_NAME missing from environment.');
    process.exit(1);
  }
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: { family: 4 },
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
    }
  );
} else {
  console.error('[FATAL] No database configuration found. Set DATABASE_URL or DB_HOST in environment.');
  process.exit(1);
}

// Import models
const modelFiles = ['participant', 'event', 'certificate', 'user', 'template', 'collaborator', 'message', 'activityLog', 'updateHistory'];
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

// Update History
db.Event.hasMany(db.UpdateHistory, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true });
db.UpdateHistory.belongsTo(db.Event, { foreignKey: 'eventId' });
db.User.hasMany(db.UpdateHistory, { foreignKey: 'sentBy' });
db.UpdateHistory.belongsTo(db.User, { foreignKey: 'sentBy', as: 'Sender' });

module.exports = { sequelize, Sequelize, ...db };
