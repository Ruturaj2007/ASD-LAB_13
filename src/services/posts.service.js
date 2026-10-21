const prisma = require('../db');

function createPost(data) {
  return prisma.post.create({ data });
}

function listPosts() {
  return prisma.post.findMany();
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
