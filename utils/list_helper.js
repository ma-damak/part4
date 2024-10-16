const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.length
    ? blogs.reduce(
        (accumulator, currentValue) => accumulator + currentValue.likes,
        0
      )
    : 0
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return {}
  } else if (blogs.length === 1) {
    return {
      title: blogs[0].title,
      author: blogs[0].author,
      likes: blogs[0].likes,
    }
  } else {
    let favoriteBlog = { likes: 0 }
    for (let blog of blogs) {
      if (blog.likes >= favoriteBlog.likes) {
        favoriteBlog = blog
      }
    }
    return {
      title: favoriteBlog.title,
      author: favoriteBlog.author,
      likes: favoriteBlog.likes,
    }
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
