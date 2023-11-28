import fs from 'node:fs';
import path from 'node:path';
import { Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { StackContext, Api } from 'sst/constructs';

import 'dotenv/config';

const PRISMA_LAYER_PATH = './layers/prisma'

function preparePrismaLayer() {
  fs.rmSync(PRISMA_LAYER_PATH, { force: true, recursive: true });
  fs.mkdirSync(PRISMA_LAYER_PATH, { recursive: true });
  const files = ['node_modules/.prisma', 'node_modules/@prisma/client', 'node_modules/prisma/build'];
  for (const file of files) {
    fs.cpSync(file, path.join(PRISMA_LAYER_PATH, 'nodejs', file), {
      filter: (srcFile) => !srcFile.endsWith('so.node') || srcFile.includes('rhel'),
      recursive: true,
    })
  }
}

export function API({ stack }: StackContext) {

  preparePrismaLayer();
  const PrismaLayer = new LayerVersion(stack, 'prisma', {
    description: 'this layer includes Prisma Client and needed binaries',
    code: Code.fromAsset(PRISMA_LAYER_PATH),
  });

  const vpc = Vpc.fromLookup(stack, process.env.AWS_VPC_ID!, {
    vpcId: process.env.AWS_VPC_ID!,
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        vpc,
        allowPublicSubnet: true,
        runtime: 'nodejs18.x',
        environment: {
          DATABASE_URL: process.env.DATABASE_URL!,
        },
        nodejs: {
          esbuild: {
            external: ['@prisma/client', '.prisma']
          },
        },
        layers: [PrismaLayer]
      },
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
