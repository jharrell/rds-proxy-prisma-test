import { prisma } from './db';
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async (_evt) => {
  console.log('starting handler! attempting to fetch users.');

  // const users = await 
  prisma.user.findMany({ 
    include: {
      posts: true
    }
  }).then((users) => {
    const body = `Hello world. The time is ${new Date().toISOString()}. There are ${users.length} users. The last user's username is ${users.at(-1)?.username}`
    return {
      statusCode: 200,
      body,
    };
  }).catch((err) => {
    return {
      statusCode: 500,
      err,
    }
  })
  

});
