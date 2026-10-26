const usersService = require('../services/users.service');
const { parsePagination } = require('../utils/pagination');

async function create(req, res) {
  const { username, email, fullname, bio } = req.body || {};

  if (
    typeof username !== 'string' ||
    username.trim() === '' ||
    typeof email !== 'string' ||
    email.trim() === '' ||
    typeof fullname !== 'string' ||
    fullname.trim() === ''
  ) {
    return res
      .status(400)
      .json({ error: 'username, email and fullname are required' });
  }

  try {
    const user = await usersService.createUser({
      username,
      email,
      fullname,
      ...(bio !== undefined ? { bio } : {}),
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error?.code === 'P2002') {
      return res
        .status(409)
        .json({ error: 'username or email already taken' });
    }

    console.error('Failed to create user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function list(req, res) {
  const { page, limit, error: pageError } = parsePagination(req.query);

  if (pageError) {
    return res.status(400).json({ error: pageError });
  }

  const sortBy = req.query.sortBy || 'createdAt';
  if (!['createdAt', 'username', 'fullname'].includes(sortBy)) {
    return res
      .status(400)
      .json({ error: 'sortBy must be one of: createdAt, username, fullname' });
  }

  const order = req.query.order || 'desc';
  if (order !== 'asc' && order !== 'desc') {
    return res.status(400).json({ error: 'order must be asc or desc' });
  }

  let isPrivate;
  if (req.query.isPrivate !== undefined) {
    if (req.query.isPrivate !== 'true' && req.query.isPrivate !== 'false') {
      return res.status(400).json({ error: 'isPrivate must be true or false' });
    }
    isPrivate = req.query.isPrivate === 'true';
  }

  let hasPosts;
  if (req.query.hasPosts !== undefined) {
    if (req.query.hasPosts !== 'true' && req.query.hasPosts !== 'false') {
      return res.status(400).json({ error: 'hasPosts must be true or false' });
    }
    hasPosts = req.query.hasPosts === 'true';
  }

  try {
    const { data, total } = await usersService.listUsers({
      page,
      limit,
      sortBy,
      order,
      isPrivate,
      hasPosts,
      search: req.query.search,
    });

    return res.status(200).json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Failed to list users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOne(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const user = await usersService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Failed to get user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function update(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const data = {};
  for (const field of ['fullname', 'bio', 'isPrivate']) {
    if (Object.hasOwn(req.body || {}, field)) {
      data[field] = req.body[field];
    }
  }

  try {
    const user = await usersService.updateUser(id, data);

    return res.status(200).json(user);
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }

    console.error('Failed to update user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function remove(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    await usersService.deleteUser(id);

    return res.status(204).send();
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }

    console.error('Failed to delete user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function listPosts(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { page, limit, error: pageError } = parsePagination(req.query);

  if (pageError) {
    return res.status(400).json({ error: pageError });
  }

  try {
    const user = await usersService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data, total } = await usersService.getUserPosts(id, {
      page,
      limit,
    });

    return res.status(200).json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Failed to list posts of user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { create, list, getOne, update, remove, listPosts };
