import { Hub, PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';
import { GraphQLError } from 'graphql';

import { builder } from '../../builder';
import { unauthenticatedError } from '../errors';

export async function sendBatteryNotification(fcmToken: string, body: string) {
  try {
    const msgId = await admin.messaging().send({
      notification: { title: 'Low Battery', body },
      android: {
        notification: { channelId: 'handleit_battery_channel' },
      },
      token: fcmToken,
    });
    console.log('Successfully sent message: ', msgId);
  } catch (err) {
    console.log('Error sending message: ', err);
  }
}

async function maybeSendBatteryAlert(
  prisma: PrismaClient,
  hub: Hub,
  newPercent: number,
  threshold = 15
) {
  const owner = await prisma.user.findFirst({ where: { id: hub.ownerId } });
  if (!owner?.fcmToken) {
    console.error("Hub doesn't have an owner with valid fcmToken");
    return;
  }
  const olderLevels = await prisma.batteryLevel.findMany({
    where: { hubId: hub.id },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });
  if (olderLevels.length < 2) return;
  const newPercentIsFirstBelow =
    newPercent <= threshold && olderLevels.every((l) => l.percent > threshold);
  if (!newPercentIsFirstBelow) return;
  sendBatteryNotification(owner.fcmToken, `Your Hub "${hub.name}"'s battery at ${newPercent}%`);
}

builder.mutationFields((t) => ({
  createHub: t.prismaField({
    type: 'Hub',
    args: {
      name: t.arg.string({ required: true }),
      serial: t.arg.string({ required: true }),
      imei: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw unauthenticatedError('User does not have access');
      const name = args.name.trim();
      return prisma.hub.create({ ...query, data: { ...args, name, ownerId: user.id } });
    },
  }),
  deleteHub: t.prismaField({
    type: 'Hub',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw unauthenticatedError('User does not have access');
      const id = Number.parseInt(args.id as string);
      const hubToDelete = await prisma.hub.findFirst({ where: { id }, include: { sensors: true } });
      if (!hubToDelete) throw new GraphQLError("Hub doesn't exist");
      if (hubToDelete.ownerId !== user.id) throw new GraphQLError('User does not have access');
      return prisma.hub.delete({ ...query, where: { id }, include: { sensors: true } });
    },
  }),
  updateHub: t.prismaField({
    type: 'Hub',
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string(),
      batteryLevel: t.arg.int(),
      isCharging: t.arg.boolean(),
      isArmed: t.arg.boolean(),
      version: t.arg.string(),
    },
    resolve: async (query, _root, args, { prisma, hub, user }) => {
      if (!hub && !user) throw unauthenticatedError('No access');
      const { id, ...data } = args;
      const isCharging = args.isCharging ?? undefined;
      const isArmed = args.isArmed ?? undefined;
      const name = args.name?.trim();
      const hubId = Number.parseInt(id as string);
      const hubToUpdate =
        hub || (await prisma.hub.findFirst({ where: { id: hubId, ownerId: user?.id } }));
      if (!hubToUpdate) throw unauthenticatedError("Hub doesn't exist");
      return prisma.hub.update({
        ...query,
        where: { id: hubToUpdate.id },
        data: { ...data, name, isCharging, isArmed },
      });
    },
  }),
  updateHubBatteryLevel: t.prismaField({
    type: 'Hub',
    description: 'Volts should be between 0 - 1023, percent between 0 - 100',
    args: {
      volts: t.arg.float({ required: true }),
      percent: t.arg.float({ required: true }),
      version: t.arg.string(),
    },
    resolve: async (_query, _root, args, { prisma, hub }) => {
      if (!hub) throw unauthenticatedError('No access');
      const { version: rawVersion, ...create } = args;
      const version = rawVersion ?? undefined;
      maybeSendBatteryAlert(prisma, hub, args.percent, 15);
      maybeSendBatteryAlert(prisma, hub, args.percent, 5);
      return prisma.hub.update({
        where: { id: hub.id },
        data: { version, batteryLevels: { create } },
      });
    },
  }),
}));
