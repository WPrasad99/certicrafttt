module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');
    const UpdateHistory = sequelize.define('UpdateHistory', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        eventId: { type: DataTypes.BIGINT, allowNull: false, field: 'event_id' },
        subject: { type: DataTypes.STRING, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        recipientCount: { type: DataTypes.INTEGER, allowNull: false, field: 'recipient_count' },
        sentBy: { type: DataTypes.BIGINT, allowNull: false, field: 'sent_by' },
        sentAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'sent_at' }
    }, {
        tableName: 'update_history',
        timestamps: false
    });
    return UpdateHistory;
};
