const prisma = require('../src/db');
const { users, posts, likes } = require('./seed-data');

// the insta## key lives inside the imageUrl, e.g. .../seed/insta01/600/600
function instaKey(imageUrl) {
  return imageUrl.split('/')[4];
}

async function main() {
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createManyAndReturn({ data: users });
  const userIdByUsername = new Map(
    createdUsers.map((user) => [user.username, user.id])
  );

  const postRows = posts.map(({ author, ...post }) => ({
    ...post,
    authorId: userIdByUsername.get(author),
  }));
  const createdPosts = await prisma.post.createManyAndReturn({ data: postRows });
  const postIdByKey = new Map(
    createdPosts.map((post) => [instaKey(post.imageUrl), post.id])
  );

  const likeRows = likes.map(({ user, post }) => ({
    userId: userIdByUsername.get(user),
    postId: postIdByKey.get(post),
  }));
  const { count: likeCount } = await prisma.like.createMany({ data: likeRows });

  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${likeCount} likes`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });