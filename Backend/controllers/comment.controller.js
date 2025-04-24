const db = require("../models");
const Comment = db.comment;
const User = db.user;

exports.createComment = async (req, res) => {
  try {
    const { content, article_id, lecture_id, parent_id } = req.body;

    if (!content) {
      return res
        .status(400)
        .send({ message: "Comment content cannot be empty." });
    }

    if (!article_id && !lecture_id) {
      return res
        .status(400)
        .send({
          message: "Comment must be associated with an article or lecture.",
        });
    }

    const comment = await Comment.create({
      content: content,
      user_id: req.userId,
      article_id: article_id || null,
      lecture_id: lecture_id || null,
      parent_id: parent_id || null,
    });

    // Fetch the created comment with user info
    const newComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "full_name", "avatar"],
        },
      ],
    });

    res.status(201).send({
      message: "Comment created successfully!",
      comment: newComment,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).send({ message: "Comment not found." });
    }

    // Check if user is the author
    if (comment.user_id !== req.userId) {
      return res.status(403).send({
        message: "You are not authorized to update this comment.",
      });
    }

    comment.content = req.body.content || comment.content;
    await comment.save();

    res.status(200).send({
      message: "Comment updated successfully!",
      comment: comment,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).send({ message: "Comment not found." });
    }

    // Check if user is the author
    if (comment.user_id !== req.userId) {
      return res.status(403).send({
        message: "You are not authorized to delete this comment.",
      });
    }

    await comment.destroy();

    res.status(200).send({
      message: "Comment deleted successfully!",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getCommentReplies = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { parent_id: req.params.id },
      include: [
        {
          model: User,
          attributes: ["id", "username", "full_name", "avatar"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    res.status(200).send(comments);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
