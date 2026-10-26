const prisma = require('../db');

function createLike(userId, postId) {
  return prisma.like.create({ data: { userId, postId } });
}

function deleteLike(userId, postId) {
  return prisma.like.delete({
    where: { userId_postId: { userId, postId } },
  });
}

module.exports = { createLike, deleteLike };
