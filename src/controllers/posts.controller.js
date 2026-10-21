const postsService = require('../services/posts.service');

async function create(req, res) {
  const { imageUrl, caption, location } = req.body || {};

  if (typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  try {
    const post = await postsService.createPost({
      imageUrl,
      ...(caption !== undefined ? { caption } : {}),
      ...(location !== undefined ? { location } : {}),
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error('Failed to create post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function list(req, res) {
  try {
    const posts = await postsService.listPosts();

    return res.status(200).json(posts);
  } catch (error) {
    console.error('Failed to list posts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOne(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'Post not found' });
  }

  try {
    const post = await postsService.getPostById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error('Failed to get post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function update(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const data = {};
  for (const field of ['caption', 'location']) {
    if (Object.hasOwn(req.body || {}, field)) {
      data[field] = req.body[field];
    }
  }

  try {
    const post = await postsService.updatePost(id, data);

    return res.status(200).json(post);
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }

    console.error('Failed to update post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function remove(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'Post not found' });
  }

  try {
    await postsService.deletePost(id);

    return res.status(204).send();
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }

    console.error('Failed to delete post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { create, list, getOne, update, remove };
