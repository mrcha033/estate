"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const supertest_1 = __importDefault(require("supertest"));
const reports_1 = __importDefault(require("./reports"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('Reports API', () => {
    let fastify;
    beforeAll(async () => {
        fastify = (0, fastify_1.default)();
        fastify.register(reports_1.default);
        await fastify.ready();
    });
    afterAll(async () => {
        await fastify.close();
        await prisma.$disconnect();
    });
    beforeEach(async () => {
        // Clear the database before each test
        await prisma.report.deleteMany({});
    });
    it('should return an empty array if no reports exist', async () => {
        const response = await (0, supertest_1.default)(fastify.server).get('/api/reports');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual([]);
    });
    it('should return reports if they exist', async () => {
        await prisma.report.create({
            data: {
                summary: 'Test Report 1',
                model_hash: 'hash1',
                prompt_hash: 'prompt1',
                s3_url: 's3://bucket/report1.html',
            },
        });
        const response = await (0, supertest_1.default)(fastify.server).get('/api/reports');
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(1);
        expect(response.body[0].summary).toEqual('Test Report 1');
    });
});
