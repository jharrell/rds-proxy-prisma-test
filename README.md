## What is this? 

This is a repo put together to show that Prisma and RDS Proxy work together and there are no longer issues with connection pinning.

## How do I run this?

### Setup

You'll first need some setup:

1. Make sure that you have a working AWS account and that your AWS Credentials are stored at `~/.aws/credentials`. You can learn more about that [here](https://docs.sst.dev/advanced/iam-credentials)

2. Make sure that you have an AWS VPC set up. VPC setup can be a bit thorny, but we just need a default one. [When you create a VPC](https://us-east-1.console.aws.amazon.com/vpcconsole/home?region=us-east-1#CreateVpc:createMode=vpcWithResources) use the "VPC and more" option and make sure that you have at least 2 public subnets.

3. [Set up a PostgreSQL RDS DB](https://us-east-1.console.aws.amazon.com/rds/home?region=us-east-1#launch-dbinstance:) using "Easy create". Make sure that you setup `PostgreSQL` and not `Aurora (PostgreSQL Compatible)`. The default settings (Dev/Test, database-1, admin) are all fine.

4. Once your database is setup and ready, [create a RDS Proxy](https://us-east-1.console.aws.amazon.com/rds/home?region=us-east-1#create-proxy:) for your database. Make sure that the Proxy is set to the `PostgreSQL` engine family, has a memorable proxy identifier, has an idle client connection timeout at a sane value (5 minutes is fine) and points to your new database in the target group. The rest of the defaults should be fine.

Once these are set up, it's time to update the values in our .env file. Rename `.env.example` to `.env` and update `DATABASE_URL`, `DIRECT_URL`, and `AWS_VPC_ID` with your values. `DATABASE_URL` should reference your RDS Proxy endpoint while `DIRECT_URL` should be your actual database (not proxied). `AWS_VPC_ID` should be the VPC that your RDS Proxy instance was deployed to.

### Install, migrate, and seed

1. Run `npm i` to install all packages. This example uses npm and not pnpm or yarn as we ran into some issues with node module resolution with those.

2. `cd` to `packages/functions` for the next steps.

2. Run migrations against your database with `npx prisma migrate deploy`. You can also use `npx prisma migrate reset` if you want a _really_ clean slate.

3. Seed your database using `npx prisma db seed` which takes the seed file located at `packages/functions/prisma/seed.js` and runs it against your database. We use this so that the data returned by our test API endpoint is repeatable.

### Deploy to AWS

`cd` back to the root of the project and run `npx sst deploy`. Please note that this repo is not setup to work with `npx sst dev` as there's some additional work to get VPCs to work with that. 

After `npx sst deploy` you should get an endpoint back that you can hit. The response will look something like this:

```
Hello world. The time is 2023-11-27T16:33:57.338Z. There are 4 users. The latest user's username is mahmoud
```

Go ahead and spam that endpoint as much as you want. In the metrics for your AWS RDS Proxy instance, you should see client connections and DB connections increase. The goal is that client connections should be able to reuse underlying DB connections. That is to say, we're looking for a point on the graphs where client connections is strictly larger than DB connections at a point in time. This will confirm that in that time frame at least one database connection was reused between more than one client.