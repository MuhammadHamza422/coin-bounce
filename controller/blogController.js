const Joi = require("joi");
const fs = require("fs");
const { BACKEND_SERVER_PATH } = require("../config");
const Blog = require("../models/blog");
const Comment = require("../models/Comment");
const BlogDto = require("../dto/blog");
const BlogDetailsDTO = require("../dto/blog-details");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  async create(req, res, next) {
    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      photo: Joi.string().required(),
    });

    const { error } = createBlogSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { title, content, author, photo } = req.body;

    // handle photo

    const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), "base64");

    const imagePath = `${Date.now()}-${author}.png`;

    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }
    let newBlog;
    try {
      newBlog = new Blog({
        title,
        content,
        author,
        photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
      });

      await newBlog.save();
    } catch (error) {
      return next(error);
    }

    const blogDto = new BlogDto(newBlog);

    return res.status(201).json({ blog: blogDto });
  },

  async getBlogById(req, res, next) {
    const getBlogbyIdSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = getBlogbyIdSchema.validate(req.params);

    if (error) {
      return next(error);
    }

    const { id } = req.params;

    let blog;

    try {
      blog = await Blog.findOne({ _id: id }).populate("author");
    } catch (error) {
      return next(error);
    }

    const blogDto = new BlogDetailsDTO(blog);

    return res.status(200).json({ blog: blogDto });
  },
  async getallBlogs(req, res, next) {
    let blogsDto = [];

    try {
      const blogs = await Blog.find({});
      for (let i = 0; i < blogs.length; i++) {
        const dto = new BlogDto(blogs[i]);
        blogsDto.push(dto);
      }

      return res.status(200).json({ blogs: blogsDto });
    } catch (error) {
      return next(error);
    }
  },
  async updateBlog(req, res, next) {
    const updatedBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      blogId: Joi.string().regex(mongodbIdPattern).required(),
      photo: Joi.string(),
    });

    const { error } = updatedBlogSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { title, content, author, blogId, photo } = req.body;

    let blog;

    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (error) {
      return next(error);
    }

    if (photo) {
      let previousPhoto = blog.photoPath;
      previousPhoto = previousPhoto.split("/".at(-1));

      fs.unlinkSync(`/storage/${previousPhoto}`); // deleteing photo

      // add new photo

      const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), "base64");

      const imagePath = `${Date.now()}-${author}.png`;

      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (error) {
        return next(error);
      }

      try {
        await Blog.updateOne(
          { _id: blogId },
          {
            title,
            content,
            photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
          }
        );
      } catch (error) {
        return next(eroor);
      }
    } else {
      await Blog.updateOne({ _id: blogId }, { title, content });
    }

    return res.statu(200).res.json({message: "Blog updated"})
  },
  async deleteBlogById(req, res, next) {
    // validate id
    // delete blog
    // delete comments on this blog

    const deleteBlogSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = deleteBlogSchema.validate(req.params);

    const { id } = req.params;

    // delete blog
    // delete comments
    try {
      await Blog.deleteOne({ _id: id });
      await Comment.deleteMany({ blog: id });
    } catch (error) {
      return next(error);
    }

    return res.status(200).json({ message: "blog deleted" });
  },
};

module.exports = blogController;
