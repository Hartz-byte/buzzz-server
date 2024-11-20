"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
// schema.ts
const graphql_1 = require("graphql");
exports.schema = (0, graphql_1.buildSchema)(`
  type Query {
    hello: String
    greet(name: String!): String
    currentUser: User
    posts(userId: String!): [Post]
    followers(userId: String!): [User]
    following(userId: String!): [User]
    getAllUsers: [User]
    searchUsers(searchTerm: String!): [User]
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    createPost(text: String, imageUrl: String, tags: [String]): Post
    followUser(targetUserId: String!): FollowResponse
    unfollowUser(targetUserId: String!): FollowResponse
  }

  type AuthPayload {
    token: String
    message: String
    user: User
  }

  type Post {
    text: String
    imageUrl: String
    createdAt: String
    user: User
    tags: [User]
  }

  type User {
    id: String
    name: String
    email: String
    followers: [User]
    following: [User]
  }

  type FollowResponse {
    message: String
    followingCount: Int
  }
`);
