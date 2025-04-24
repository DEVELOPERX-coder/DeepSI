module.exports = (sequelize, Sequelize) => {
  const CourseLecture = sequelize.define(
    "course_lecture",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      section_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      video_url: {
        type: Sequelize.STRING(255),
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "Duration in minutes",
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      resources: {
        type: Sequelize.TEXT,
        comment: "JSON formatted resources",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      timestamps: false,
      tableName: "course_lectures",
    }
  );

  return CourseLecture;
};
