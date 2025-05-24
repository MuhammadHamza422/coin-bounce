const express = require("express");
const commentController = require("../controller/commentController");
const router = express.Router();

// create comment
router.post('/comment', commentController.create);
// read comment
router.get('/comment/:id', commentController.getCommentsbyBlogId)
module.exports = router;
