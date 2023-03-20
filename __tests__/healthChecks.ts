import { PrismaClient } from '@prisma/client';
import assert from 'assert';
import { gql } from 'graphql-tag';

import { seedDb } from '../prisma/seedService';
import { server } from '../src/server';

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient();
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
  await seedDb(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

it('registers a new user', async () => {
  const { body } = await server.executeOperation(
    {
      query: gql`
        mutation registerWithPassword {
          registerWithPassword(email: "my@guy.com", password: "password", fcmToken: "token")
        }
      `,
    },
    { contextValue: { prisma } }
  );

  assert(body.kind === 'single');
  expect(body.singleResult.data?.registerWithPassword).toBeDefined();
});
