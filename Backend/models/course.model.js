module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define(
    "course",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      thumbnail: {
        type: Sequelize.STRING(255),
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      total_duration: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "Duration in minutes",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      timestamps: false,
    }
  );

  return Course;
};
