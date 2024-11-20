"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_graphql_1 = require("express-graphql");
const schema_1 = require("./graphql/schema");
const resolver_1 = require("./graphql/resolver");
const app = (0, express_1.default)();
app.use(
  (0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.use((0, cors_1.default)());
// Set up the GraphQL endpoint
app.use(
  "/graphql",
  (0, express_graphql_1.graphqlHTTP)((req) => {
    var _a;
    return {
      schema: schema_1.schema,
      rootValue: resolver_1.resolvers,
      context: {
        token:
          (_a = req.headers.authorization) === null || _a === void 0
            ? void 0
            : _a.split(" ")[1],
      },
      graphiql: true,
      customFormatErrorFn: (error) => {
        // Customize error response
        console.error("GraphQL Error:", error.message);
        return {
          message: error.message,
          locations: error.locations,
          path: error.path,
        };
      },
    };
  })
);
// Custom 404 Middleware
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `add "/graphql" at the current url endpoint`,
  });
});
// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});
exports.default = app;
