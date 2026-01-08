module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');
    const Message = sequelize.define('Message', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        eventId: { type: DataTypes.BIGINT, allowNull: false, field: 'event_id' },
        userId: { type: DataTypes.BIGINT, allowNull: false, field: 'user_id' },
        receiverId: { type: DataTypes.BIGINT, allowNull: true, field: 'receiver_id' },
        content: { type: DataTypes.TEXT, allowNull: false },
        isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' }
    }, {
        tableName: 'messages',
        timestamps: true
    });
    return Message;
};
