const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.category = require("./category.model.js")(sequelize, Sequelize);
db.article = require("./article.model.js")(sequelize, Sequelize);
db.course = require("./course.model.js")(sequelize, Sequelize);
db.section = require("./section.model.js")(sequelize, Sequelize);
db.lecture = require("./lecture.model.js")(sequelize, Sequelize);
db.comment = require("./comment.model.js")(sequelize, Sequelize);
db.donation = require("./donation.model.js")(sequelize, Sequelize);

// Associations
db.category.hasMany(db.article);
db.article.belongsTo(db.category);

db.user.hasMany(db.article, { foreignKey: "author_id" });
db.article.belongsTo(db.user, { foreignKey: "author_id", as: "author" });

db.user.hasMany(db.course, { foreignKey: "instructor_id" });
db.course.belongsTo(db.user, { foreignKey: "instructor_id", as: "instructor" });

db.category.hasMany(db.course);
db.course.belongsTo(db.category);

db.course.hasMany(db.section);
db.section.belongsTo(db.course);

db.section.hasMany(db.lecture);
db.lecture.belongsTo(db.section);

db.user.hasMany(db.comment);
db.comment.belongsTo(db.user);

db.article.hasMany(db.comment);
db.lecture.hasMany(db.comment);
db.comment.belongsTo(db.article);
db.comment.belongsTo(db.lecture);

db.comment.hasMany(db.comment, { foreignKey: "parent_id", as: "replies" });
db.comment.belongsTo(db.comment, { foreignKey: "parent_id", as: "parent" });

db.user.hasMany(db.donation);
db.donation.belongsTo(db.user);

// User-Article likes (many-to-many)
db.user.belongsToMany(db.article, {
  through: "user_article_likes",
  as: "likedArticles",
  foreignKey: "user_id",
});
db.article.belongsToMany(db.user, {
  through: "user_article_likes",
  as: "likedBy",
  foreignKey: "article_id",
});

// User-Course enrollments (many-to-many)
db.user.belongsToMany(db.course, {
  through: "user_courses",
  as: "enrolledCourses",
  foreignKey: "user_id",
});
db.course.belongsToMany(db.user, {
  through: "user_courses",
  as: "students",
  foreignKey: "course_id",
});

module.exports = db;
