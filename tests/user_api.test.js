const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const User = require('../models/user')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  let userObject = new User(helper.initialUsers[0])
  await userObject.save()
  userObject = new User(helper.initialUsers[1])
  await userObject.save()
})

// 4.16
describe('addition of a new user', () => {
  test('fails with status code 400 if username is missing', async () => {
    const noUsernameUser = {
      name: 'mohamed',
      password: 'password',
    }

    const response = await api
      .post('/api/users')
      .send(noUsernameUser)
      .expect(400)
    assert(
      response.body.error.includes('username: Path `username` is required')
    )
  })
  test('fails with status code 400 if username is less than 3 characters long', async () => {
    const shortUsernameUser = {
      username: 'mo',
      name: 'mohamed',
      password: 'password',
    }

    const response = await api
      .post('/api/users')
      .send(shortUsernameUser)
      .expect(400)
    assert(
      response.body.error.includes('shorter than the minimum allowed length')
    )
  })
  test('fails with status code 400 if username is not unique', async () => {
    const usersAtStart = await helper.usersInDb()
    const user = usersAtStart[0]

    const userToAdd = {
      username: user.username,
      name: 'amine',
      password: 'password',
    }

    const response = await api.post('/api/users').send(userToAdd).expect(400)
    assert(response.body.error.includes('expected `username` to be unique'))
  })
  test('fails with status code 400 if password is missing', async () => {
    const noPasswordUser = {
      name: 'mohamed',
      username: 'username',
    }

    const response = await api
      .post('/api/users')
      .send(noPasswordUser)
      .expect(400)
    assert(
      response.body.error.includes('password: Path `password` is required')
    )
  })
  test('fails with status code 400 if password is less than 3 characters long', async () => {
    const shortPasswordUser = {
      username: 'mahmoud',
      name: 'mahmoud',
      password: 'pa',
    }

    const response = await api
      .post('/api/users')
      .send(shortPasswordUser)
      .expect(400)
    assert(
      response.body.error.includes('shorter than the minimum allowed length')
    )
  })
})

after(async () => {
  await mongoose.connection.close()
})
