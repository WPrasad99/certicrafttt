module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');
    const Collaborator = sequelize.define('Collaborator', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        eventId: { type: DataTypes.BIGINT, allowNull: false, field: 'event_id' },
        userId: { type: DataTypes.BIGINT, allowNull: false, field: 'user_id' },
        status: { type: DataTypes.STRING, defaultValue: 'PENDING' }, // PENDING, ACCEPTED
        role: { type: DataTypes.STRING, defaultValue: 'VIEWER' }
    }, {
        tableName: 'collaborators',
        timestamps: true
    });
    return Collaborator;
};
