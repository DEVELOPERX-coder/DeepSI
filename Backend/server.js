const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, "../Frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/views/index.html"));
});

// Database
const db = require("./models");

// Sync database
db.sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => {
    console.error("Failed to sync database: " + err.message);
  });

// Routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/article.routes")(app);
require("./routes/course.routes")(app);
require("./routes/comment.routes")(app);
require("./routes/donation.routes")(app);

// Set up server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../Frontend/views/404.html"));
});
