const authJwt = require("../middlewares/auth");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get user profile
  app.get("/api/user/profile", [authJwt.verifyToken], controller.getProfile);

  // Update user profile
  app.put("/api/user/profile", [authJwt.verifyToken], controller.updateProfile);

  // Get liked articles
  app.get(
    "/api/user/liked-articles",
    [authJwt.verifyToken],
    controller.getLikedArticles
  );

  // Get enrolled courses
  app.get(
    "/api/user/enrolled-courses",
    [authJwt.verifyToken],
    controller.getEnrolledCourses
  );
};
