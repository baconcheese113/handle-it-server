import { Hub } from '@prisma/client';
import { builder } from '../../builder';

builder.prismaObject('Network', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name'),
    members: t.relation('members'),
    createdById: t.exposeInt('createdById'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    hubs: t.withAuth({ loggedIn: true }).prismaField({
      type: ['Hub'],
      resolve: async (query, network, _args, { prisma, user }) => {
        const members = await prisma.networkMember.findMany({
          ...query,
          where: {
            networkId: network.id,
            NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }],
          },
          include: { user: { include: { hubs: true } } },
        });
        // TODO make sure user is part of this network
        const canAccess = members.some((m) => m.userId === user.id);
        const hubs = members.reduce((hubList, mem) => [...hubList, ...mem.user.hubs], [] as Hub[]);
        return canAccess ? hubs : [];
      },
    }),
  }),
});
