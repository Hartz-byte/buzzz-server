"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const schema_1 = require("./graphql/schema");
const resolver_1 = require("./graphql/resolver");
const app = (0, express_1.default)();
const allowCors = (req, res, next) => {
    // Ensure return type is void
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, PATCH, DELETE, POST, PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }
    next();
};
app.use(allowCors);
// Set up the GraphQL endpoint
app.use("/graphql", (0, express_graphql_1.graphqlHTTP)((req) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    return {
        schema: schema_1.schema,
        rootValue: resolver_1.resolvers,
        context: { token },
        graphiql: true,
        customFormatErrorFn: (error) => {
            console.error("GraphQL Error:", error.message);
            return {
                message: error.message,
                locations: error.locations,
                path: error.path,
            };
        },
    };
}));
// Custom 404 Middleware
app.use((req, res, next) => {
    res.status(404).json({
        error: "Not Found",
        message: `add "/graphql" at the current URL endpoint`,
    });
});
exports.default = app;
