"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const app_1 = __importDefault(require("./app"));
// const env_1 = require("./env");
const database_1 = require("./config/database");
// Connect to MongoDB
(0, database_1.connectToDatabase)()
  .then(() => {
    app_1.default.listen(process.env.PORT, () => {
      console.log(
        `GraphQL server is running at http://localhost:${process.env.PORT}/graphql`
      );
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  });
