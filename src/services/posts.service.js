const prisma = require('../db');

const postInclude = {
  author: { select: { id: true, username: true, fullname: true } },
  _count: { select: { likes: true } },
};

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

  const orderBy =
    sortBy === 'likes'
      ? [{ likes: { _count: order } }, { createdAt: 'desc' }]
      : { [sortBy]: order };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

function getPostById(id) {
  return prisma.post.findUnique({ where: { id }, include: postInclude });
}

function updatePost(id, data) {
  return prisma.post.update({ where: { id }, data });
}

function deletePost(id) {
  return prisma.post.delete({ where: { id } });
}

async function listPostLikers(postId) {
  const rows = await prisma.like.findMany({
    where: { postId },
    orderBy: { user: { username: 'asc' } },
    select: { user: { select: { id: true, username: true, fullname: true } } },
  });

  return rows.map((row) => row.user);
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  listPostLikers,
};
