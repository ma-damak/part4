const { Router } = require('express')
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

const blogsRouter = Router()

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  res.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (req, res, next) => {
  const { title, author, url, likes } = req.body
  try {
    const user = req.user

    const blog = new Blog({ title, author, url, likes, user: user._id })
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    res.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (req, res, next) => {
  try {
    const userId = req.user._id

    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).end()
    }

    if (userId.toString() !== blog.user.toString()) {
      return res.status(401).json({ error: 'token invalid' })
    }

    await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  const { title, author, url, likes } = req.body

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, author, url, likes },
      { new: true, runValidators: true }
    )

    if (!updatedBlog) {
      return res.status(404).end()
    }

    res.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter
