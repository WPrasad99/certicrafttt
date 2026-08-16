module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const Participant = sequelize.define('Participant', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    eventId: { type: DataTypes.BIGINT, allowNull: false, field: 'event_id' },
    updateEmailStatus: { type: DataTypes.STRING, allowNull: true, defaultValue: 'NOT_SENT', field: 'update_email_status' },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' }
  }, {
    tableName: 'participants',
    timestamps: false,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['event_id', 'email'], unique: true } // prevent duplicate emails per event
    ]
  });
  return Participant;
};