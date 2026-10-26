const prisma = require('../db');

function createUser(data) {
  return prisma.user.create({ data });
}

async function listUsers({ page, limit, sortBy, order, isPrivate, hasPosts, search }) {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (hasPosts !== undefined) {
    where.posts = hasPosts ? { some: {} } : { none: {} };
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { fullname: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
}

function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { posts: true, likes: true } } },
  });
}

function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}

function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

async function getUserPosts(userId, { page, limit }) {
  const where = { authorId: userId };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: { _count: { select: { likes: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

async function getLikedPosts(userId, { page, limit }) {
  const where = { likes: { some: { userId } } };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, fullname: true } },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getLikedPosts,
};
