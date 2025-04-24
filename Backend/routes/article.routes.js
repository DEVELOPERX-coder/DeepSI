const authJwt = require("../middlewares/auth");
const controller = require("../controllers/article.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get all articles (public)
  app.get("/api/articles", controller.getAllArticles);

  // Get article by ID (public)
  app.get("/api/articles/:id", controller.getArticleById);

  // Create new article (authenticated)
  app.post("/api/articles", [authJwt.verifyToken], controller.createArticle);

  // Update article (authenticated + owner)
  app.put("/api/articles/:id", [authJwt.verifyToken], controller.updateArticle);

  // Delete article (authenticated + owner)
  app.delete(
    "/api/articles/:id",
    [authJwt.verifyToken],
    controller.deleteArticle
  );

  // Like/unlike article (authenticated)
  app.post(
    "/api/articles/:id/like",
    [authJwt.verifyToken],
    controller.likeArticle
  );

  // Search articles (public)
  app.get("/api/articles/search", controller.searchArticles);
};
