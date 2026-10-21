const prisma = require('../db');

function createUser(data) {
  return prisma.user.create({ data });
}

function listUsers() {
  return prisma.user.findMany();
}

function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}

function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

module.exports = { createUser, listUsers, getUserById, updateUser, deleteUser };
