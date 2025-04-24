module.exports = (sequelize, Sequelize) => {
  const Donation = sequelize.define(
    "donation",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING(100),
      },
      name: {
        type: Sequelize.STRING(100),
      },
      message: {
        type: Sequelize.TEXT,
      },
      is_anonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      timestamps: false,
    }
  );

  return Donation;
};
