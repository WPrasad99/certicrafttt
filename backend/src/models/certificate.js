module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const Certificate = sequelize.define('Certificate', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    verificationId: { type: DataTypes.STRING, field: 'verification_id' },
    participantId: { type: DataTypes.BIGINT, allowNull: false, field: 'participant_id' },
    eventId: { type: DataTypes.BIGINT, allowNull: false, field: 'event_id' },
    filePath: { type: DataTypes.STRING, field: 'file_path' },
    generationStatus: { type: DataTypes.STRING, defaultValue: 'PENDING', field: 'generation_status' },
    emailStatus: { type: DataTypes.STRING, defaultValue: 'NOT_SENT', field: 'email_status' },
    generatedAt: { type: DataTypes.DATE, field: 'generated_at' },
    emailSentAt: { type: DataTypes.DATE, field: 'email_sent_at' },
    errorMessage: { type: DataTypes.TEXT, field: 'error_message' },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, allowNull: true, field: 'updated_at' }
  }, {
    tableName: 'certificates',
    timestamps: false
  });
  return Certificate;
};