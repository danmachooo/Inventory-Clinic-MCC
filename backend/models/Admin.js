const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
  },
  voucher: {
    type: DataTypes.STRING,
  },
}
);

  // Hash password before saving
  Admin.beforeSave(async (admin) => {
    if (admin.password) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }
  });


module.exports = Admin;

