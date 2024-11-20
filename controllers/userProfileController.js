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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowUser = exports.followUser = exports.fetchPosts = exports.createPost = void 0;
// userProfileController.ts
const UserProfile_1 = require("../models/UserProfile");
const mongoose_1 = __importDefault(require("mongoose"));
const Post_1 = require("../models/Post");
const User_1 = require("../models/User");
// Create a post (text or image)
const createPost = (userId, text, imageUrl, tags // Accepting array of user IDs
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If tags are provided, ensure they are valid users
        let tagUsers = [];
        if (tags && tags.length > 0) {
            tagUsers = yield User_1.User.find({ _id: { $in: tags } });
            // If any tags are invalid (not found in the database), you could filter them out
            const validTags = tagUsers.map((user) => { var _a; return (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString(); });
            const invalidTags = tags.filter((tag) => !validTags.includes(tag));
            if (invalidTags.length > 0) {
                // You can throw an error or simply ignore invalid tags
                console.warn(`Invalid tags provided: ${invalidTags.join(", ")}`);
            }
        }
        // Create new post
        const newPost = new Post_1.Post({
            text,
            imageUrl,
            user: new mongoose_1.default.Types.ObjectId(userId),
            tags: tagUsers.map((user) => user._id), // Store the valid tagged users
            createdAt: new Date(),
        });
        yield newPost.save();
        return { message: "Post created successfully", post: newPost };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Internal server error");
        }
        else {
            throw new Error("Unknown error occurred");
        }
    }
});
exports.createPost = createPost;
// Fetch posts
const fetchPosts = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        // Get the user's profile to determine who they're following
        const userProfile = yield UserProfile_1.UserProfile.findOne({
            user: new mongoose_1.default.Types.ObjectId(userId),
        }).populate("following");
        if (!userProfile) {
            throw new Error("User profile not found");
        }
        // Get the IDs of the user and those they are following
        const userAndFollowingIds = [
            userProfile.user,
            ...userProfile.following.map((followedUser) => followedUser._id),
        ];
        // Fetch posts from the user and their following
        const posts = yield Post_1.Post.find({ user: { $in: userAndFollowingIds } })
            .populate("user", "name") // Populate the user's name
            .sort({ createdAt: -1 }) // Sort posts by newest first
            .skip((page - 1) * limit)
            .limit(limit); // Pagination
        return posts;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Internal server error");
        }
        else {
            throw new Error("Unknown error occurred");
        }
    }
});
exports.fetchPosts = fetchPosts;
// Follow another user
const followUser = (userId, targetUserId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (userId === targetUserId) {
            throw new Error("You cannot follow yourself");
        }
        const userProfile = yield UserProfile_1.UserProfile.findOne({
            user: new mongoose_1.default.Types.ObjectId(userId),
        });
        const targetUserProfile = yield UserProfile_1.UserProfile.findOne({
            user: new mongoose_1.default.Types.ObjectId(targetUserId),
        });
        if (!userProfile || !targetUserProfile) {
            throw new Error("User profiles not found");
        }
        if (userProfile.following.some((followedUserId) => followedUserId.equals(new mongoose_1.default.Types.ObjectId(targetUserId)))) {
            throw new Error("Already following this user");
        }
        // Add to following and followers arrays
        userProfile.following.push(new mongoose_1.default.Types.ObjectId(targetUserId));
        targetUserProfile.followers.push(new mongoose_1.default.Types.ObjectId(userId));
        yield userProfile.save();
        yield targetUserProfile.save();
        return {
            message: "Followed successfully",
            followingCount: userProfile.following.length,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Internal server error");
        }
        else {
            throw new Error("Unknown error occurred");
        }
    }
});
exports.followUser = followUser;
// Unfollow another user
const unfollowUser = (userId, targetUserId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (userId === targetUserId) {
            throw new Error("You cannot unfollow yourself");
        }
        const userProfile = yield UserProfile_1.UserProfile.findOne({
            user: new mongoose_1.default.Types.ObjectId(userId),
        });
        const targetUserProfile = yield UserProfile_1.UserProfile.findOne({
            user: new mongoose_1.default.Types.ObjectId(targetUserId),
        });
        if (!userProfile || !targetUserProfile) {
            throw new Error("User profiles not found");
        }
        if (!userProfile.following.some((followedUserId) => followedUserId.equals(new mongoose_1.default.Types.ObjectId(targetUserId)))) {
            throw new Error("You are not following this user");
        }
        // Remove from following and followers arrays
        userProfile.following = userProfile.following.filter((followedUserId) => !followedUserId.equals(new mongoose_1.default.Types.ObjectId(targetUserId)));
        targetUserProfile.followers = targetUserProfile.followers.filter((followerId) => !followerId.equals(new mongoose_1.default.Types.ObjectId(userId)));
        yield userProfile.save();
        yield targetUserProfile.save();
        return {
            message: "Unfollowed successfully",
            followingCount: userProfile.following.length,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Internal server error");
        }
        else {
            throw new Error("Unknown error occurred");
        }
    }
});
exports.unfollowUser = unfollowUser;
