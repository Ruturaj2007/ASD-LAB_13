const prisma = require('../src/db');
const { users, posts } = require('./seed-data');

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const { count: userCount } = await prisma.user.createMany({ data: users });
  const { count: postCount } = await prisma.post.createMany({ data: posts });

  console.log(`🌱 Seeded ${userCount} users and ${postCount} posts`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
