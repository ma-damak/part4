const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

// 4.8
test('two blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

// 4.9
test('the unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs')
  const ids = response.body.map((blog) => blog.id)

  assert.strictEqual(ids.includes(undefined), false)
  assert.strictEqual([...new Set(ids)].length, ids.length)
})

describe('addition of a new blog', () => {
  // 4.10
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map((blog) => blog.title)

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    assert(titles.includes('Canonical string reduction'))
  })

  // 4.11
  test('if the likes property is missing, it will default to 0', async () => {
    const noLikesBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    }

    const response = await api
      .post('/api/blogs')
      .send(noLikesBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)
  })

  // 4.12
  test('fails with status code 400 if the title is missing', async () => {
    const noTitleBlog = {
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 5,
    }

    await api.post('/api/blogs').send(noTitleBlog).expect(400)
  })

  test('fails with status code 400 if the url is missing', async () => {
    const noUrlBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 5,
    }

    await api.post('/api/blogs').send(noUrlBlog).expect(400)
  })
})

// 4.13
describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((r) => r.title)
    assert(!titles.includes(blogToDelete.title))
  })
  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = 'invalidId'

    await api.delete(`/api/blogs/${invalidId}`).expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

// 4.14
describe('updating a blog', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: blogToUpdate.likes + 1 })
      .expect(200)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
  })
  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = 'invalidId'

    await api.put(`/api/blogs/${invalidId}`).send({ likes: 100 }).expect(400)
  })
  test('fails with status code 404 if blog is not existing', async () => {
    const nonExistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send({ likes: 100 })
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})
