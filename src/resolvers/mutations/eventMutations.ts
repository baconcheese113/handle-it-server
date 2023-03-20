import assert from 'assert';
import * as admin from 'firebase-admin';
import { GraphQLError } from 'graphql';

import { builder } from '../../builder';

builder.mutationFields((t) => ({
  createEvent: t.prismaField({
    type: 'Event',
    args: {
      serial: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, hub }) => {
      if (!hub) throw new GraphQLError('Hub does not have access');
      const { serial } = args;
      const sensor = await prisma.sensor.findFirst({ where: { serial, hubId: hub.id } });
      if (!sensor) throw new GraphQLError("Sensor doesn't exist");
      const owner = await prisma.user.findFirst({ where: { id: hub.ownerId } });
      if (!owner?.fcmToken) throw new Error("Hub doesn't have an owner with valid fcmToken");
      const createdEvent = await prisma.event.create({ ...query, data: { sensorId: sensor.id } });
      if (owner.defaultFullNotification && hub.isArmed) {
        try {
          const msgId = await admin.messaging().send({
            data: {
              type: 'alert',
              title: `${hub.name} detected that a handle was pulled`,
              body: "Your phone wasn't detected nearby",
              eventId: `${createdEvent.id}`,
              hubSerial: hub.serial,
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
      return createdEvent;
    },
  }),
  propagateEventToNetworks: t.prismaField({
    type: 'Event',
    args: {
      eventId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw new GraphQLError('User does not have access');
      const { eventId } = args;
      const event = await prisma.event.findFirst({
        where: { id: eventId, sensor: { hub: { ownerId: user.id } } },
        include: { sensor: { include: { hub: true } } },
      });
      if (!event) throw new GraphQLError("User doesn't have access to event or doesn't exist");
      if (event.propagatedAt) throw new GraphQLError('Event already propagated to networks');
      const userNetworks = await prisma.network.findMany({
        where: {
          members: {
            some: {
              userId: user.id,
              NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }],
            },
          },
        },
      });
      const userNetworkIds = userNetworks.map((n) => n.id);
      const usersToNotify = await prisma.user.findMany({
        where: {
          NOT: [{ fcmToken: null }, { id: user.id }],
          networkMemberships: { some: { networkId: { in: userNetworkIds } } },
          notificationOverrides: { none: { isMuted: true, hubId: event.sensor.hubId } },
        },
        include: { networkMemberships: { include: { network: true } } },
      });
      const userNetworkIdsSet = new Set(userNetworkIds);
      const ownerName = user.firstName || user.email;
      for await (const u of usersToNotify) {
        if (u.defaultFullNotification) {
          const sharedNetworks = u.networkMemberships
            .filter((m) => userNetworkIdsSet.has(m.networkId))
            .map((m) => m.network.name);
          const sharedNetworkStr = (sharedNetworks.length > 1 ? 's ' : ' ') + sharedNetworks.join();
          try {
            assert(u.fcmToken);
            const msgId = await admin.messaging().send({
              data: {
                type: 'alert',
                title: `Handle pull on network${sharedNetworkStr}`,
                body: `${ownerName}'s hub: "${event.sensor.hub.name}"`,
              },
              android: {
                priority: 'high',
              },
              token: u.fcmToken,
            });
            console.log('Successfully sent message: ', msgId);
          } catch (err) {
            console.log('Error sending message: ', err);
          }
        }
      }
      return prisma.event.update({
        where: { id: event.id },
        data: { ...query, propagatedAt: new Date() },
      });
    },
  }),
}));
