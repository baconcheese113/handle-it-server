import { Prisma } from '@prisma/client';
import { builder } from '../../builder';
import { NetworkMemberStatus } from './networkMemberGraphType';

export const Viewer = builder.objectRef<Record<string, never>>('Viewer').implement({
  fields: (t) => ({
    user: t.withAuth({ loggedIn: true }).prismaField({
      type: 'User',
      resolve: (_query, _root, _args, { user }) => {
        return user;
      },
    }),
    hubs: t.withAuth({ loggedIn: true }).prismaField({
      type: ['Hub'],
      resolve: (query, _root, _args, { prisma, user }) => {
        return prisma.hub.findMany({ ...query, where: { ownerId: user.id } });
      },
    }),
    networks: t.withAuth({ loggedIn: true }).prismaField({
      type: ['Network'],
      args: {
        status: t.arg({ type: NetworkMemberStatus }),
      },
      resolve: async (query, _root, args, { prisma, user }) => {
        const { status } = args;
        let additionalArgs: Prisma.NetworkMemberWhereInput = {};
        if (status == NetworkMemberStatus.active) {
          additionalArgs = { NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }] };
        } else if (status == NetworkMemberStatus.invited) {
          additionalArgs = { inviteeAcceptedAt: null, NOT: { inviterAcceptedAt: null } };
        } else if (status == NetworkMemberStatus.requested) {
          additionalArgs = { NOT: { inviteeAcceptedAt: null }, inviterAcceptedAt: null };
        }
        return prisma.network.findMany({
          ...query,
          where: { members: { some: { userId: user.id, ...additionalArgs } } },
        });
      },
    }),
    latestSensorVersion: t.string({
      resolve: () => process.env.SENSOR_CURRENT_FIRMWARE_VERSION ?? '0.0.0',
    }),
  }),
});
