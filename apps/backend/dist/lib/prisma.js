"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const secrets_1 = require("./secrets");
let prisma;
if (process.env.NODE_ENV === 'production') {
    // In production, ensure secrets are loaded before initializing Prisma
    const secrets = (0, secrets_1.getSecrets)();
    process.env.DATABASE_URL = secrets.DATABASE_URL;
    exports.prisma = prisma = new client_1.PrismaClient();
}
else {
    if (!global.__prisma) {
        const secrets = (0, secrets_1.getSecrets)();
        process.env.DATABASE_URL = secrets.DATABASE_URL;
        global.__prisma = new client_1.PrismaClient();
    }
    exports.prisma = prisma = global.__prisma;
}
