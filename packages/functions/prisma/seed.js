import { PrismaClient, Prisma } from "@prisma/client";

const SEED_DATA = [
    {
      username: 'alice',
      email: 'alice@prisma.io',
      posts: {
        create: [
          {
            title: 'Join the Prisma Discord',
            body: 'it\'s at https://pris.ly/discord',
          },
        ],
      },
    },
    {
      username: 'nilu',
      email: 'nilu@prisma.io',
      posts: {
        create: [
          {
            title: 'Follow Prisma on Twitter',
            body: 'https://www.twitter.com/prisma',
          },
        ],
      },
    },
    {
      username: 'mahmoud',
      email: 'mahmoud@prisma.io',
      posts: {
        create: [
          {
            title: 'Ask a question about Prisma on GitHub',
            body: 'https://www.github.com/prisma/prisma/discussions',
          },
          {
            title: 'Prisma on YouTube',
            body: 'you can find it I believe in you'
          },
        ],
      },
    },
  ]

const prisma = new PrismaClient();
async function main() {
    console.log('start seed');
    for (const user of SEED_DATA) {
        const res = await prisma.user.create({ data: user });
        console.log(`created user ${res.id}`);
    }
    console.log('done.')
}

main().catch(async (e) => { console.error(e) }).finally(async () => await prisma.$disconnect())