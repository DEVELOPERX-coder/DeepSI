const authJwt = require("../middlewares/auth");
const controller = require("../controllers/donation.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Make donation (public, but can be authenticated)
  app.post("/api/donations", controller.makeDonation);

  // Get recent donations (public)
  app.get("/api/donations/recent", controller.getRecentDonations);
};
