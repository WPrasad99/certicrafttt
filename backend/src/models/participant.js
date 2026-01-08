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
    timestamps: false
  });
  return Participant;
};