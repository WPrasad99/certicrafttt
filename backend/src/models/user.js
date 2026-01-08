module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const User = sequelize.define('User', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    fullName: { type: DataTypes.STRING, allowNull: true, field: 'full_name' },
    passwordHash: { type: DataTypes.STRING, field: 'password_hash' },
    provider: { type: DataTypes.STRING, defaultValue: 'local' },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' }
  }, {
    tableName: 'users',
    timestamps: false
  });
  return User;
};