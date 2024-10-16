const { Router } = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const usersRouter = Router()

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
  })
  res.json(users)
})

usersRouter.post('/', async (req, res, next) => {
  const { username, password, name } = req.body

  if (!password) {
    return res.status(400).json({
      error: 'User validation failed: password: Path `password` is required.',
    })
  }

  if (password.length < 3) {
    return res.status(400).json({
      error:
        'User validation failed: password: Path `password` (`' +
        password +
        '`) is shorter than the minimum allowed length (3).',
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({ username, name, passwordHash })

  try {
    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
