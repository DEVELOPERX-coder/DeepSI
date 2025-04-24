const db = require("../models");
const Article = db.article;
const User = db.user;
const Category = db.category;
const Comment = db.comment;
const { Op } = require("sequelize");

exports.getAllArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.categoryId;

    let condition = {};
    if (categoryId) {
      condition.category_id = categoryId;
    }

    const articles = await Article.findAndCountAll({
      where: condition,
      limit: limit,
      offset: offset,
      include: [
        {
          model: User,
          as: "author",
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
      totalItems: articles.count,
      articles: articles.rows,
      totalPages: Math.ceil(articles.count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "full_name", "avatar"],
        },
        {
          model: Category,
          attributes: ["id", "name"],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "username", "full_name", "avatar"],
            },
          ],
          where: { parent_id: null },
          required: false,
        },
      ],
    });

    if (!article) {
      return res.status(404).send({ message: "Article not found." });
    }

    // Increment views
    article.views += 1;
    await article.save();

    // Check if user has liked this article
    let isLiked = false;
    if (req.userId) {
      const user = await User.findByPk(req.userId, {
        include: [
          {
            model: Article,
            as: "likedArticles",
            where: { id: req.params.id },
            required: false,
          },
        ],
      });

      isLiked = user.likedArticles.length > 0;
    }

    res.status(200).send({
      ...article.toJSON(),
      isLiked,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const article = await Article.create({
      title: req.body.title,
      content: req.body.content,
      thumbnail: req.body.thumbnail,
      author_id: req.userId,
      category_id: req.body.category_id,
    });

    res.status(201).send({
      message: "Article created successfully!",
      article: article,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).send({ message: "Article not found." });
    }

    // Check if user is the author
    if (article.author_id !== req.userId) {
      return res.status(403).send({
        message: "You are not authorized to update this article.",
      });
    }

    // Update fields
    article.title = req.body.title || article.title;
    article.content = req.body.content || article.content;
    article.thumbnail = req.body.thumbnail || article.thumbnail;
    article.category_id = req.body.category_id || article.category_id;

    await article.save();

    res.status(200).send({
      message: "Article updated successfully!",
      article: article,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).send({ message: "Article not found." });
    }

    // Check if user is the author
    if (article.author_id !== req.userId) {
      return res.status(403).send({
        message: "You are not authorized to delete this article.",
      });
    }

    await article.destroy();

    res.status(200).send({
      message: "Article deleted successfully!",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).send({ message: "Article not found." });
    }

    const user = await User.findByPk(req.userId);

    // Check if already liked
    const alreadyLiked = await user.hasLikedArticle(article);

    if (alreadyLiked) {
      // Unlike
      await user.removeLikedArticle(article);
      article.likes -= 1;
      await article.save();

      return res.status(200).send({
        message: "Article unliked successfully!",
        liked: false,
        likes: article.likes,
      });
    } else {
      // Like
      await user.addLikedArticle(article);
      article.likes += 1;
      await article.save();

      return res.status(200).send({
        message: "Article liked successfully!",
        liked: true,
        likes: article.likes,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.searchArticles = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).send({ message: "Search query is required." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const articles = await Article.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { content: { [Op.like]: `%${query}%` } },
        ],
      },
      limit: limit,
      offset: offset,
      include: [
        {
          model: User,
          as: "author",
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
      totalItems: articles.count,
      articles: articles.rows,
      totalPages: Math.ceil(articles.count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
