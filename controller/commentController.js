const Joi = require("joi");
const Comment = require("../models/Comment");
const CommentDTO = require("../dto/comment");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const commentController = {
  async create(req, res, next) {
    const createCommentSchema = Joi.object({
      author: Joi.string().regex(mongodbIdPattern).required(),
      blog: Joi.string().regex(mongodbIdPattern).required(),
      content: Joi.string().required(),
    });

    const { error } = createCommentSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { author, blog, content } = req.body;

    try {
      commentToAdd = new Comment({
        author,
        content,
        blog,
      });

      await commentToAdd.save();
    } catch (error) {
      return next(error);
    }

    return res.status(201).json({ message: "comment created!" });
  },
  async getCommentsbyBlogId(req, res, next) {
    const getCommentScehma = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = getCommentScehma.validate(req.params);

    if (error) {
      return next(error);
    }

    const { id } = req.params;

    let commentsDto = [];

    try {
      const comments = await Comment.find({ blog: id }).populate("author");

      for (let i = 0; i < comments.length; i++) {
        dto = new CommentDTO(comments[i]);
        commentsDto.push(dto);
      }

      return res.status(200).json({comments: commentsDto})
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = commentController;
