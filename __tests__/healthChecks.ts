import { PrismaClient } from '@prisma/client';
import assert from 'assert';

import { seedDb } from '../prisma/seedService';
import { server } from '../src/server';
import { graphql } from './gql';
import { RegisterWithPasswordMutation, TestUserViewerQuery } from './gql/graphql';

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

describe('basic entrypoint checks', () => {
  it('registers a new user', async () => {
    const { body } = await server.executeOperation<RegisterWithPasswordMutation>(
      {
        query: graphql(`
          mutation registerWithPassword {
            registerWithPassword(email: "my@guy.com", password: "password", fcmToken: "token")
          }
        `),
      },
      { contextValue: { prisma, user: null, hub: null } }
    );

    assert(body.kind === 'single');
    const { data } = body.singleResult;
    assert(!!data);
    expect(data.registerWithPassword).toBeDefined();
  });

  it('can access viewer', async () => {
    const email = 'test@user.com';
    const user = await prisma.user.findFirstOrThrow({ where: { email } });
    const { body } = await server.executeOperation<TestUserViewerQuery>(
      {
        query: graphql(`
          query testUserViewer {
            viewer {
              user {
                id
                email
              }
            }
          }
        `),
      },
      {
        contextValue: { prisma, user, hub: null },
      }
    );

    assert(body.kind === 'single');
    const { data } = body.singleResult;
    assert(!!data);
    expect(data.viewer).toBeDefined();
    expect(data.viewer.user.email).toBe(email);
  });

  it('can register a new hub', async () => {
    const email = 'test@user.com';
    const user = await prisma.user.findFirstOrThrow({ where: { email } });
    const { body } = await server.executeOperation(
      {
        query: graphql(`
          mutation loginAsHub($userId: ID!) {
            loginAsHub(userId: $userId, serial: "someSerialNumber", imei: "someImeiNumber")
          }
        `),
        variables: { userId: user.id },
      },
      { contextValue: { prisma, user: null, hub: null } }
    );

    assert(body.kind === 'single');
    const { data } = body.singleResult;
    assert(!!data);
    expect(data.loginAsHub).toBeDefined();
  });
});
