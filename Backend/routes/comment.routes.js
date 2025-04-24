const authJwt = require("../middlewares/auth");
const controller = require("../controllers/comment.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create comment (authenticated)
  app.post("/api/comments", [authJwt.verifyToken], controller.createComment);

  // Update comment (authenticated + owner)
  app.put("/api/comments/:id", [authJwt.verifyToken], controller.updateComment);

  // Delete comment (authenticated + owner)
  app.delete(
    "/api/comments/:id",
    [authJwt.verifyToken],
    controller.deleteComment
  );

  // Get comment replies (public)
  app.get("/api/comments/:id/replies", controller.getCommentReplies);
};
