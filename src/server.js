const { app } = require('./index');
const prisma = require('./db');
const port = 3000;

app.use(require('express').json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/users', async (req, res) => {
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
    const user = await prisma.user.create({
      data: {
        username,
        email,
        fullname,
        ...(bio !== undefined ? { bio } : {}),
      },
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
});

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Failed to list users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Failed to get user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/users/:id', async (req, res) => {
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
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return res.status(200).json(user);
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }

    console.error('Failed to update user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }

    console.error('Failed to delete user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});