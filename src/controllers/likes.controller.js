const likesService = require('../services/likes.service');
const postsService = require('../services/posts.service');
const usersService = require('../services/users.service');

async function create(req, res) {
  const postId = Number.parseInt(req.params.id, 10);
  const { userId } = req.body || {};

  if (
    userId === undefined ||
    userId === null ||
    !Number.isInteger(Number(userId))
  ) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const post = Number.isInteger(postId)
      ? await postsService.getPostById(postId)
      : null;

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const user = await usersService.getUserById(Number(userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const like = await likesService.createLike(Number(userId), postId);

    return res.status(201).json(like);
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Already liked' });
    }

    console.error('Failed to like post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function remove(req, res) {
  const postId = Number.parseInt(req.params.id, 10);
  const userId = Number.parseInt(req.params.userId, 10);

  if (!Number.isInteger(postId) || !Number.isInteger(userId)) {
    return res.status(404).json({ error: 'Like not found' });
  }

  try {
    await likesService.deleteLike(userId, postId);

    return res.status(204).send();
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Like not found' });
    }

    console.error('Failed to unlike post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { create, remove };
