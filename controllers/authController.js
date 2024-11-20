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
exports.getCurrentUser = exports.login = exports.signup = void 0;
// authController.ts
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "your_jwt_secret_key";
// Sign-up
const signup = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!name || !email || !password) {
            throw new Error("All fields are required");
        }
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists");
        }
        const user = new User_1.User({ name, email, password });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        return {
            message: "User registered successfully",
            token,
            user: {
                id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString(),
                name: user.name,
                email: user.email,
            },
        };
    }
    catch (error) {
        // Assert the error as an instance of Error
        if (error instanceof Error) {
            throw new Error(error.message || "Internal server error");
        }
        else {
            throw new Error("Unknown error occurred");
        }
    }
});
exports.signup = signup;
// Login
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findOne({ email });
        if (!user || !(yield user.comparePassword(password))) {
            throw new Error("Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        return {
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        };
    }
    catch (error) {
        // Handle the error as an instance of Error
        if (error instanceof Error) {
            console.error("Error during login1:", error);
            throw new Error(error.message || "Internal server error");
        }
        else {
            console.error("Error during login2:", error);
            throw new Error("Unknown error occurred");
        }
    }
});
exports.login = login;
// Middleware to get user from token
const getCurrentUser = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!token) {
            throw new Error("No token provided");
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield User_1.User.findById(decoded.id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Invalid token");
        }
        else {
            throw new Error("Unknown error occurred");
        }
    }
});
exports.getCurrentUser = getCurrentUser;
