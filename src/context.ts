import { StandaloneServerContextFunctionArgument } from '@apollo/server/standalone';
import { Hub, PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const prisma = new PrismaClient();

export function getJwt(): string {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return process.env.JWT_SECRET;
}

function fromGlobalId(token: string): { id: number; type: string } {
  const decodedToken = jwt.verify(token, getJwt()) as string;
  const [type, stringId] = decodedToken.split(':');
  return { id: Number.parseInt(stringId), type };
}
async function getUser(authorization: string): Promise<User | null> {
  const splitAuthorization = authorization.split('Bearer ');
  if (splitAuthorization.length !== 2) return null;
  const { type, id } = fromGlobalId(splitAuthorization[1]);
  if (type !== 'User') return null;
  return prisma.user.findFirst({ where: { id } });
}

async function getHub(authorization: string): Promise<Hub | null> {
  const splitAuthorization = authorization.split('Bearer ');
  if (splitAuthorization.length !== 2) return null;
  const { type, id } = fromGlobalId(splitAuthorization[1]);
  if (type !== 'Hub') return null;
  return prisma.hub.findFirst({ where: { id } });
}

export interface IContext {
  prisma: PrismaClient;
  user: User | null;
  hub: Hub | null;
}

export interface IAuthContext extends IContext {
  user: User;
}

export async function createContext({
  req,
}: StandaloneServerContextFunctionArgument): Promise<IContext> {
  const authorization = req.headers.authorization;
  console.log('authorization', req.headers);
  const user = authorization ? await getUser(authorization) : null;
  const hub = authorization ? await getHub(authorization) : null;
  console.log(`Dealing with ${user ? 'a User' : hub ? 'a Hub' : 'an anon'}`);
  return { prisma, user, hub };
}
