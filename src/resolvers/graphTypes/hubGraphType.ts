import { builder } from '../../builder';

export const Hub = builder.prismaObject('Hub', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name'),
    isCharging: t.exposeBoolean('isCharging', { nullable: true }),
    batteryLevel: t.float({
      nullable: true,
      description: 'Battery level from 0 - 100',
      select: {
        batteryLevels: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      resolve: (hub) => hub.batteryLevels?.at(0)?.percent,
    }),
    isArmed: t.exposeBoolean('isArmed'),
    ownerId: t.exposeInt('ownerId'),
    owner: t.relation('owner'),
    serial: t.exposeString('serial'),
    latestVersion: t.string({
      resolve: () => process.env.HUB_CURRENT_FIRMWARE_VERSION ?? '0.1.0',
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    vehicle: t.relation('vehicle', { nullable: true }),
    sensors: t.relation('sensors'),
    locations: t.relation('locations'),
    events: t.withAuth({ loggedIn: true }).prismaField({
      type: ['Event'],
      resolve: (query, hub, _args, { prisma }) => {
        return prisma.event.findMany({ ...query, where: { sensor: { hubId: hub.id } } });
      },
    }),
    networks: t.withAuth({ loggedIn: true }).prismaField({
      type: ['Network'],
      resolve: async (query, hub, _args, { prisma, user }) => {
        const networkMemberships = await prisma.networkMember.findMany({
          ...query,
          where: {
            userId: hub.ownerId,
            NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }],
          },
          include: { network: true },
        });
        const theirHubNetworks = networkMemberships.map((mem) => mem.network);
        const userNetworkMemberships = await prisma.networkMember.findMany({
          where: {
            userId: user.id,
            NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }],
          },
          include: { network: true },
        });
        const userNetworkIds = new Set(userNetworkMemberships.map((mem) => mem.network.id));
        // Only return networks I can see
        return theirHubNetworks.filter((n) => userNetworkIds.has(n.id));
      },
    }),
    notificationOverride: t.withAuth({ loggedIn: true }).prismaField({
      type: 'NotificationOverride',
      nullable: true,
      resolve: (query, hub, _args, { prisma, user }) => {
        return prisma.notificationOverride.findFirst({
          ...query,
          where: { userId: user.id, hubId: hub.id },
        });
      },
    }),
  }),
});
