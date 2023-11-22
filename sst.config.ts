import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "rds-proxy-prisma-test",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(API);
    app.setDefaultRemovalPolicy('destroy')
  }
} satisfies SSTConfig;
