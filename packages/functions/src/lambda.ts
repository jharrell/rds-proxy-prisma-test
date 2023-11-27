import { prisma } from './db';
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async (_evt) => {
  console.log('starting handler! attempting to fetch users.');
  try {
    const users = await prisma.user.findMany({ include: { posts: true }});
    console.log(`Users found! Returning info about ${users.length} users.`);
    const body = `Hello world. The time is ${new Date().toISOString()}. There are ${users.length} users. The latest user's username is ${users.at(-1)?.username}`
    return {
      statusCode: 200,
      body,
    };
  } catch (error) {
    console.error('uh oh.');
    console.error(error);
    return {
      statusCode: 500,
      error,
    }
  }
});
