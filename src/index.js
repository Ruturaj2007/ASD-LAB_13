const express = require('express');

const usersRouter = require('./routes/users.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/users', usersRouter);

module.exports = { app };
