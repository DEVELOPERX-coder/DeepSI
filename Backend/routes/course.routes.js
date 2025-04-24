const authJwt = require("../middlewares/auth");
const controller = require("../controllers/course.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get all courses (public)
  app.get("/api/courses", controller.getAllCourses);

  // Get course by ID (public)
  app.get("/api/courses/:id", controller.getCourseById);

  // Get lecture by ID (requires enrollment for paid courses)
  app.get(
    "/api/lectures/:lectureId",
    [authJwt.verifyToken],
    controller.getLectureById
  );

  // Enroll in course (authenticated)
  app.post(
    "/api/courses/:id/enroll",
    [authJwt.verifyToken],
    controller.enrollCourse
  );

  // Update course progress (authenticated + enrolled)
  app.put(
    "/api/courses/:id/progress",
    [authJwt.verifyToken],
    controller.updateProgress
  );

  // Search courses (public)
  app.get("/api/courses/search", controller.searchCourses);
};
