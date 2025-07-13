import Fastify from 'fastify';
import supertest from 'supertest';
import reportsRoute from './reports';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Reports API', () => {
  let fastify: any;

  beforeAll(async () => {
    fastify = Fastify();
    fastify.register(reportsRoute);
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
    const response = await supertest(fastify.server).get('/api/reports');
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

    const response = await supertest(fastify.server).get('/api/reports');
    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].summary).toEqual('Test Report 1');
  });
});
