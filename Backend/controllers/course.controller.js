const db = require("../models");
const Course = db.course;
const Section = db.section;
const Lecture = db.lecture;
const User = db.user;
const Category = db.category;
const Comment = db.comment;
const { Op } = require("sequelize");

exports.getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.categoryId;

    let condition = {};
    if (categoryId) {
      condition.category_id = categoryId;
    }

    const courses = await Course.findAndCountAll({
      where: condition,
      limit: limit,
      offset: offset,
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "username", "full_name", "avatar"],
        },
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).send({
      totalItems: courses.count,
      courses: courses.rows,
      totalPages: Math.ceil(courses.count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "username", "full_name", "avatar"],
        },
        {
          model: Category,
          attributes: ["id", "name"],
        },
        {
          model: Section,
          include: [
            {
              model: Lecture,
              order: [["position", "ASC"]],
            },
          ],
          order: [["position", "ASC"]],
        },
      ],
    });

    if (!course) {
      return res.status(404).send({ message: "Course not found." });
    }

    // Check if user is enrolled
    let enrollment = null;
    if (req.userId) {
      const user = await User.findByPk(req.userId);
      enrollment = await user.getEnrolledCourses({
        where: { id: req.params.id },
        through: { attributes: ["progress", "last_lecture_id", "enrolled_at"] },
      });

      if (enrollment.length > 0) {
        enrollment = enrollment[0].user_courses;
      } else {
        enrollment = null;
      }
    }

    res.status(200).send({
      ...course.toJSON(),
      enrollment,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findByPk(req.params.lectureId, {
      include: [
        {
          model: Section,
          include: [
            {
              model: Course,
              include: [
                {
                  model: User,
                  as: "instructor",
                  attributes: ["id", "username", "full_name", "avatar"],
                },
              ],
            },
          ],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "username", "full_name", "avatar"],
            },
          ],
        },
      ],
    });

    if (!lecture) {
      return res.status(404).send({ message: "Lecture not found." });
    }

    // Check if user is enrolled in the course
    if (req.userId) {
      const user = await User.findByPk(req.userId);
      const course = lecture.section.course;

      const enrollment = await user.getEnrolledCourses({
        where: { id: course.id },
      });

      if (enrollment.length === 0 && course.price > 0) {
        return res.status(403).send({
          message: "You need to enroll in this course to access lectures.",
        });
      }

      // Update last lecture viewed
      if (enrollment.length > 0) {
        await db.sequelize.query(
          `UPDATE user_courses SET last_lecture_id = ? WHERE user_id = ? AND course_id = ?`,
          {
            replacements: [lecture.id, req.userId, course.id],
            type: db.sequelize.QueryTypes.UPDATE,
          }
        );
      }
    }

    res.status(200).send(lecture);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).send({ message: "Course not found." });
    }

    const user = await User.findByPk(req.userId);

    // Check if already enrolled
    const enrollment = await user.getEnrolledCourses({
      where: { id: course.id },
    });

    if (enrollment.length > 0) {
      return res.status(400).send({
        message: "You are already enrolled in this course.",
      });
    }

    // For paid courses, payment processing would go here
    // For now, we're just allowing free enrollment

    // Enroll user in course
    await user.addEnrolledCourse(course, {
      through: {
        progress: 0,
        last_lecture_id: null,
      },
    });

    res.status(200).send({
      message: "Successfully enrolled in course!",
      enrollment: {
        user_id: user.id,
        course_id: course.id,
        progress: 0,
        enrolled_at: new Date(),
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const progress = req.body.progress;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).send({
        message: "Progress must be a number between 0 and 100.",
      });
    }

    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).send({ message: "Course not found." });
    }

    // Update progress
    await db.sequelize.query(
      `UPDATE user_courses SET progress = ? WHERE user_id = ? AND course_id = ?`,
      {
        replacements: [progress, req.userId, req.params.id],
        type: db.sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).send({
      message: "Course progress updated successfully!",
      progress: progress,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.searchCourses = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).send({ message: "Search query is required." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const courses = await Course.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
        ],
      },
      limit: limit,
      offset: offset,
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "username", "full_name", "avatar"],
        },
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).send({
      totalItems: courses.count,
      courses: courses.rows,
      totalPages: Math.ceil(courses.count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
