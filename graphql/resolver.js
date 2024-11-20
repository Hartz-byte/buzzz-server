"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
// resolver.ts
const User_1 = require("../models/User");
const authController_1 = require("../controllers/authController");
const userProfileController_1 = require("../controllers/userProfileController");
const UserProfile_1 = require("../models/UserProfile");
const Post_1 = require("../models/Post");
exports.resolvers = {
    hello: () => "Hello, GraphQL!",
    greet: ({ name }) => `Hello, ${name}!`,
    signup: (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, email, password, }) {
        try {
            const user = yield (0, authController_1.signup)(name, email, password);
            // Create a user profile after successful signup
            const userProfile = new UserProfile_1.UserProfile({
                user: user.user.id, // Link to the user
                followers: [], // Empty array of followers initially
                following: [], // Empty array of following initially
            });
            yield userProfile.save(); // Save the user profile
            return {
                token: user.token,
                message: "User created successfully, profile initialized.",
            };
        }
        catch (error) {
            if (error instanceof Error) {
                return { message: error.message, token: null };
            }
            else {
                return { message: "Unknown error occurred", token: null };
            }
        }
    }),
    login: (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, password }) {
        try {
            const result = yield (0, authController_1.login)(email, password);
            return result;
        }
        catch (error) {
            if (error instanceof Error) {
                return { message: error.message, token: null };
            }
            else {
                return { message: "Unknown error occurred", token: null };
            }
        }
    }),
    currentUser: (_, context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const user = yield (0, authController_1.getCurrentUser)(context.token);
        if (!user) {
            throw new Error("User not found");
        }
        // Fetch the user's profile to get followers and following
        const userProfile = yield UserProfile_1.UserProfile.findOne({ user: user._id })
            .populate("followers")
            .populate("following");
        if (!userProfile) {
            throw new Error("User profile not found");
        }
        // Return user details with followers and following
        return {
            id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString(),
            name: user.name,
            email: user.email,
            followers: userProfile.followers,
            following: userProfile.following,
        };
    }),
    getAllUsers: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { limit = 10, skip = 0 }) {
        try {
            const users = yield User_1.User.find({}, "id name email followers following")
                .skip(skip)
                .limit(limit);
            return users;
        }
        catch (error) {
            console.error("Error fetching all users:", error);
            throw new Error("Failed to fetch users");
        }
    }),
    createPost: (_a, context_1) => __awaiter(void 0, [_a, context_1], void 0, function* ({ text, imageUrl }, context) {
        const user = yield (0, authController_1.getCurrentUser)(context.token);
        if (!user) {
            throw new Error("User not found");
        }
        // Ensure user._id is properly typed
        return yield (0, userProfileController_1.createPost)(user._id.toString(), text, imageUrl);
    }),
    followUser: (_a, context_1) => __awaiter(void 0, [_a, context_1], void 0, function* ({ targetUserId }, context) {
        const user = yield (0, authController_1.getCurrentUser)(context.token);
        if (!user) {
            throw new Error("User not found");
        }
        // Ensure user._id is properly typed
        return yield (0, userProfileController_1.followUser)(user._id.toString(), targetUserId);
    }),
    unfollowUser: (_a, context_1) => __awaiter(void 0, [_a, context_1], void 0, function* ({ targetUserId }, context) {
        const user = yield (0, authController_1.getCurrentUser)(context.token);
        if (!user) {
            throw new Error("User not found");
        }
        // Ensure user._id is properly typed
        return yield (0, userProfileController_1.unfollowUser)(user._id.toString(), targetUserId);
    }),
    posts: (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
        const userProfile = yield UserProfile_1.UserProfile.findOne({ user: userId }).populate("following");
        if (!userProfile) {
            throw new Error("User not found");
        }
        const followedUserIds = userProfile.following.map((followedUser) => followedUser._id);
        followedUserIds.push(userProfile.user);
        const posts = yield Post_1.Post.find({ user: { $in: followedUserIds } })
            .populate("user")
            .exec();
        const postsWithUserNames = posts.map((post) => (Object.assign(Object.assign({}, post.toObject()), { user: post.user })));
        return postsWithUserNames;
    }),
    followers: (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
        const userProfile = yield UserProfile_1.UserProfile.findOne({ user: userId }).populate("followers");
        return userProfile ? userProfile.followers : [];
    }),
    following: (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
        const userProfile = yield UserProfile_1.UserProfile.findOne({ user: userId }).populate("following");
        return userProfile ? userProfile.following : [];
    }),
    searchUsers: (_a) => __awaiter(void 0, [_a], void 0, function* ({ searchTerm }) {
        try {
            const users = yield User_1.User.find({
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { email: { $regex: searchTerm, $options: "i" } },
                ],
            }, "id name email");
            return users;
        }
        catch (error) {
            console.error("Error searching users:", error);
            throw new Error("Failed to search users");
        }
    }),
};
