import { GraphQLError } from 'graphql';

import { builder } from '../../builder';

builder.mutationFields((t) => ({
  updateNotificationOverride: t.prismaField({
    type: 'NotificationOverride',
    args: {
      hubId: t.arg.int({ required: true }),
      shouldMute: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw new GraphQLError('User does not have access');
      const { hubId, shouldMute } = args;
      const existingSetting = await prisma.notificationOverride.findFirst({
        where: { userId: user.id, hubId },
      });
      const data = { hubId, isMuted: shouldMute, userId: user.id };

      if (existingSetting) {
        return prisma.notificationOverride.update({ where: { id: existingSetting.id }, data });
      }
      return prisma.notificationOverride.create({ ...query, data });
    },
  }),
}));
