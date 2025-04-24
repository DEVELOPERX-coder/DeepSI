const db = require("../models");
const User = db.user;
const Article = db.article;
const Course = db.course;

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Update allowed fields
    if (req.body.full_name) user.full_name = req.body.full_name;
    if (req.body.bio) user.bio = req.body.bio;

    // Password update with verification
    if (req.body.password && req.body.currentPassword) {
      const passwordIsValid = bcrypt.compareSync(
        req.body.currentPassword,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          message: "Current password is incorrect!",
        });
      }

      user.password = bcrypt.hashSync(req.body.password, 8);
    }

    await user.save();

    res.status(200).send({
      message: "Profile updated successfully!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getLikedArticles = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Article,
          as: "likedArticles",
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    res.status(200).send(user.likedArticles);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Course,
          as: "enrolledCourses",
          through: {
            attributes: ["progress", "last_lecture_id", "enrolled_at"],
          },
        },
      ],
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    res.status(200).send(user.enrolledCourses);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
