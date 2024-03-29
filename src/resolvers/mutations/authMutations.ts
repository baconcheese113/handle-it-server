import { Hub as HubModel } from '@prisma/client';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

import { builder } from '../../builder';
import { getJwt } from '../../context';
import { Hub } from '../graphTypes/hubGraphType';

const LoginAndFetchHubPayload = builder
  .objectRef<{ hub: HubModel; token: string }>('LoginAndFetchHubPayload')
  .implement({
    fields: (t) => ({
      hub: t.field({ type: Hub, resolve: (root) => root.hub }),
      token: t.string({ resolve: (root) => root.token }),
    }),
  });

builder.mutationFields((t) => ({
  registerWithPassword: t.string({
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      fcmToken: t.arg.string({ required: true }),
      firstName: t.arg.string(),
      lastName: t.arg.string(),
    },
    resolve: async (_root, args, { prisma, user }) => {
      if (user) return jwt.sign(`User:${user.id}`, getJwt());
      const email = args.email.trim();
      const unregisteredUser = await prisma.user.findFirst({ where: { email, password: null } });
      const data = {
        ...args,
        password: await bcrypt.hash(args.password, 10),
        email: args.email.trim(),
        firstName: args.firstName?.trim(),
        lastName: args.lastName?.trim(),
        activatedAt: new Date(),
      };

      const newUser = unregisteredUser
        ? await prisma.user.update({ where: { email }, data })
        : await prisma.user.create({ data });

      return jwt.sign(`User:${newUser.id}`, getJwt());
    },
  }),
  loginWithPassword: t.string({
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      fcmToken: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { prisma, user }) => {
      if (user) return jwt.sign(`User:${user.id}`, getJwt());
      const { email, password, fcmToken } = args;
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('hashedPassword', hashedPassword);
      const foundUser = await prisma.user.findFirst({ where: { email, NOT: { password: null } } });
      if (!foundUser?.password) throw new GraphQLError('User not found, unable to login');
      const isCorrectPwd = await bcrypt.compare(password, foundUser.password);
      if (!isCorrectPwd) throw new GraphQLError('Password incorrect, unable to login');
      await prisma.user.update({ where: { email }, data: { fcmToken } });

      return jwt.sign(`User:${foundUser.id}`, getJwt());
    },
  }),
  loginAndFetchHub: t.field({
    type: LoginAndFetchHubPayload,
    args: {
      userId: t.arg.id({ required: true }),
      serial: t.arg.string({ required: true }),
      imei: t.arg.string({ required: true }),
      version: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { prisma, hub }) => {
      if (hub) return { hub, token: jwt.sign(`Hub:${hub.id}`, getJwt()) };
      const { serial, imei, version } = args;
      const userId = Number.parseInt(args.userId as string);
      if (!Number.isFinite(userId)) throw new Error('Invalid userId');
      const connectedUser = await prisma.user.findFirst({ where: { id: userId } });
      if (!connectedUser) throw new Error('User does not exist');
      const serialHub = await prisma.hub.findFirst({ where: { serial } });
      // if(serialHub) throw new Error("Hub already registered")
      // if(listOfValidSerials.contains(serial)) throw new Error("Invalid serial")
      const connectedHub =
        serialHub ??
        (await prisma.hub.create({
          data: { name: 'TempName', serial, imei, version, ownerId: userId },
        }));
      const token = jwt.sign(`Hub:${connectedHub.id}`, getJwt());
      return { hub: connectedHub, token };
    },
  }),
  loginAsHub: t.string({
    deprecationReason: `9/17/23. Use loginAndFetchHub instead.`,
    args: {
      userId: t.arg.id({ required: true }),
      serial: t.arg.string({ required: true }),
      imei: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { prisma, hub }) => {
      if (hub) return jwt.sign(`Hub:${hub.id}`, getJwt());
      const { serial, imei } = args;
      const userId = Number.parseInt(args.userId as string);
      if (!Number.isFinite(userId)) throw new Error('Invalid userId');
      const connectedUser = await prisma.user.findFirst({ where: { id: userId } });
      if (!connectedUser) throw new Error('User does not exist');
      const serialHub = await prisma.hub.findFirst({ where: { serial } });
      // if(serialHub) throw new Error("Hub already registered")
      // if(listOfValidSerials.contains(serial)) throw new Error("Invalid serial")
      const connectedHub =
        serialHub ||
        (await prisma.hub.create({ data: { name: 'TempName', serial, imei, ownerId: userId } }));
      return jwt.sign(`Hub:${connectedHub.id}`, getJwt());
    },
  }),
}));
