const prisma = require('../db');

function createPost(data) {
  return prisma.post.create({ data });
}

async function listPosts({ page, limit, sortBy, order, location, search, from, to }) {
  const where = {};

  if (location) {
    where.location = { equals: location, mode: 'insensitive' };
  }

  if (search) {
    where.caption = { contains: search, mode: 'insensitive' };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = from;
    }
    if (to) {
      where.createdAt.lt = to;
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

function getPostById(id) {
  return prisma.post.findUnique({ where: { id } });
}

function updatePost(id, data) {
  return prisma.post.update({ where: { id }, data });
}

function deletePost(id) {
  return prisma.post.delete({ where: { id } });
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost };
