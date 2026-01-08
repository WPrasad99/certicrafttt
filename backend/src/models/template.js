module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');
    const Template = sequelize.define('Template', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        eventId: { type: DataTypes.BIGINT, allowNull: false, field: 'event_id' },
        originalName: { type: DataTypes.STRING, field: 'original_name' },
        filePath: { type: DataTypes.STRING, field: 'file_path' },
        nameX: { type: DataTypes.INTEGER, defaultValue: 50, field: 'name_x' },
        nameY: { type: DataTypes.INTEGER, defaultValue: 50, field: 'name_y' },
        qrX: { type: DataTypes.INTEGER, defaultValue: 80, field: 'qr_x' },
        qrY: { type: DataTypes.INTEGER, defaultValue: 80, field: 'qr_y' },
        qrSize: { type: DataTypes.INTEGER, defaultValue: 100, field: 'qr_size' },
        fontSize: { type: DataTypes.INTEGER, defaultValue: 40, field: 'font_size' },
        fontColor: { type: DataTypes.STRING, defaultValue: '#000000', field: 'font_color' },
        aspectRatio: { type: DataTypes.FLOAT, defaultValue: 1.414, field: 'aspect_ratio' },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
        updatedAt: { type: DataTypes.DATE, allowNull: true, field: 'updated_at' }
    }, {
        tableName: 'templates',
        timestamps: false
    });
    return Template;
};
