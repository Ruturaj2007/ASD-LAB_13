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
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const rawLimit =
    req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(rawLimit) ||
    rawLimit < 1
  ) {
    return res
      .status(400)
      .json({ error: 'page and limit must be positive integers' });
  }

  const limit = Math.min(rawLimit, 50);

  const sortBy = req.query.sortBy || 'createdAt';
  if (!['createdAt', 'updatedAt'].includes(sortBy)) {
    return res
      .status(400)
      .json({ error: 'sortBy must be one of: createdAt, updatedAt' });
  }

  const order = req.query.order || 'desc';
  if (order !== 'asc' && order !== 'desc') {
    return res.status(400).json({ error: 'order must be asc or desc' });
  }

  let from;
  if (req.query.from !== undefined) {
    from = new Date(req.query.from);
    if (Number.isNaN(from.getTime())) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
  }

  let to;
  if (req.query.to !== undefined) {
    to = new Date(req.query.to);
    if (Number.isNaN(to.getTime())) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
  }

  try {
    const { data, total } = await postsService.listPosts({
      page,
      limit,
      sortBy,
      order,
      location: req.query.location,
      search: req.query.search,
      from,
      to,
    });

    return res.status(200).json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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
