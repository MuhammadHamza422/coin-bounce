class BlogDto{
    constructor(blog){
        this.title = blog.title,
        this.content = blog.content,
        this.author = blog.author,
        this.photo= blog.photoPath,
        this.createdAt= blog.createdAt,
        this.updatedAt= blog.updatedAt
    }
}

module.exports = BlogDto;