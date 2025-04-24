module.exports = {
  secret: process.env.JWT_SECRET || "deepsi-secret-key",
  jwtExpiration: 86400, // 24 hours
};
