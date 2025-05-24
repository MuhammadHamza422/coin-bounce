const express = require("express");
const auth = require("../middleware/auth");
const blogController = require("../controller/blogController")
const router = express.Router();

// create blog
router.post('/blog', auth, blogController.create);
// read blog detail by id
router.get("/blog/:id", auth, blogController.getBlogById);
// read all blogs
router.get("/all", auth, blogController.getallBlogs);
// update blog
router.put("/blog", auth, blogController.updateBlog);
// delete blog
router.delete("/blog/:id", auth, blogController.deleteBlogById);

module.exports = router;
