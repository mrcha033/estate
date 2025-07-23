"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("./secrets");
const JWT_SECRET = (0, secrets_1.getSecrets)().JWT_SECRET || 'supersecretjwtkey';
const generateToken = (payload, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: expiresIn
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
