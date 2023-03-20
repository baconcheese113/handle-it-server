import assert from 'assert';
import * as admin from 'firebase-admin';
import { GraphQLError } from 'graphql';

import { builder } from '../../builder';

builder.mutationFields((t) => ({
  createSensor: t.prismaField({
    type: 'Sensor',
    args: {
      doorColumn: t.arg.int({ required: true }),
      doorRow: t.arg.int({ required: true }),
      serial: t.arg.id({ required: true }),
      isConnected: t.arg.boolean(),
      isOpen: t.arg.boolean(),
      batteryLevel: t.arg.int(),
    },
    resolve: async (query, _root, args, { prisma, hub }) => {
      if (!hub) throw new GraphQLError('Hub does not have access');
      const { isConnected, isOpen, serial, ...otherArgs } = args;
      // TODO ensure sensors only linked to a single hub
      // const serialSensor = await prisma.sensor.findFirst({ where: { serial: args.serial }})
      // if(serialSensor) throw new GraphQLError("Sensor already added")
      return prisma.sensor.upsert({
        ...query,
        create: {
          hubId: hub.id,
          isConnected: !!isConnected,
          isOpen: !!isOpen,
          serial: serial as string,
          ...otherArgs,
        },
        update: {
          isConnected: !!isConnected,
          isOpen: !!isOpen,
          serial: serial as string,
          ...otherArgs,
        },
        where: {
          serial: args.serial as string,
        },
      });
    },
  }),
  updateSensor: t.prismaField({
    type: 'Sensor',
    args: {
      id: t.arg.id({ required: true }),
      isOpen: t.arg.boolean(),
    },
    resolve: async (query, _root, args, { prisma, hub }) => {
      if (!hub) throw new GraphQLError('Hub does not have access');
      const id = Number.parseInt(args.id as string);
      const isOpen = args.isOpen ?? undefined;
      const sensorToUpdate = await prisma.sensor.findFirst({ where: { id, hubId: hub.id } });
      if (!sensorToUpdate) throw new GraphQLError("Sensor doesn't exist");
      if (sensorToUpdate.isOpen === isOpen) return sensorToUpdate;
      if (isOpen) {
        const owner = await prisma.user.findFirst({ where: { id: hub.ownerId } });
        if (!owner) throw new Error("Hub doesn't have an owner");
        assert(owner.fcmToken, 'User does not have an FCM token');
        await prisma.event.create({ data: { sensorId: id } });
        if (owner.defaultFullNotification && hub.isArmed) {
          try {
            const msgId = await admin.messaging().send({
              data: {
                type: 'alert',
                title: `${hub.name} detected that a handle was pulled`,
                body: "Your phone wasn't detected nearby",
              },
              android: {
                priority: 'high',
              },
              token: owner.fcmToken,
            });
            console.log('Successfully sent message: ', msgId);
          } catch (err) {
            console.log('Error sending message: ', err);
          }
        }
      }
      return prisma.sensor.update({ ...query, where: { id }, data: { ...sensorToUpdate, isOpen } });
    },
  }),
}));
