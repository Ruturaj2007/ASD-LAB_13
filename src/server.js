const { app, prisma } = require('./index');
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

app.listen(port, () => {
  console.log(`Server Started on port ${port}`);
});