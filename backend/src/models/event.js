module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const Event = sequelize.define('Event', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    eventName: { type: DataTypes.STRING, allowNull: false, field: 'event_name' },
    eventDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'event_date' },
    organizerName: { type: DataTypes.STRING, allowNull: false, field: 'organizer_name' },
    instituteName: { type: DataTypes.STRING, allowNull: true, field: 'institute_name' },
    organizerId: { type: DataTypes.BIGINT, allowNull: false, field: 'organizer_id' },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, allowNull: true, field: 'updated_at' }
  }, {
    tableName: 'events',
    timestamps: false
  });
  return Event;
};