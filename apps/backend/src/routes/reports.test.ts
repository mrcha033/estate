import Fastify from 'fastify';
import supertest from 'supertest';

// Mock Prisma Client before importing the route
const mockFindMany = jest.fn();
const mockDeleteMany = jest.fn();
const mockCreate = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    report: {
      findMany: mockFindMany,
      deleteMany: mockDeleteMany,
      create: mockCreate,
    },
    $disconnect: mockDisconnect,
  })),
}));

import reportsRoute from './reports';

describe('Reports API', () => {
  let fastify: any;

  beforeAll(async () => {
    fastify = Fastify();
    fastify.register(reportsRoute);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should return an empty array if no reports exist', async () => {
    // Mock empty result
    mockFindMany.mockResolvedValue([]);

    const response = await supertest(fastify.server).get('/api/reports');
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual([]);
  });

  it('should return reports if they exist', async () => {
    const mockReport = {
      id: 1,
      summary: 'Test Report 1',
      model_hash: 'hash1',
      prompt_hash: 'prompt1',
      s3_url: 's3://bucket/report1.html',
      created_at: new Date(),
    };

    // Mock result with one report
    mockFindMany.mockResolvedValue([mockReport]);

    const response = await supertest(fastify.server).get('/api/reports');
    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].summary).toEqual('Test Report 1');
  });
});
