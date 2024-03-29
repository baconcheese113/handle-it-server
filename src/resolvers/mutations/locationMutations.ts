import { builder } from '../../builder';
import { unauthenticatedError } from '../errors';

builder.mutationFields((t) => ({
  createLocation: t.prismaField({
    type: 'Location',
    args: {
      lat: t.arg.float({ required: true }),
      lng: t.arg.float({ required: true }),
      hdop: t.arg.float({ required: true }),
      speed: t.arg.float({ required: true }),
      age: t.arg.int({ required: true }),
      course: t.arg.float({ required: true }),
    },
    resolve: (query, _root, args, { prisma, hub }) => {
      if (!hub) throw unauthenticatedError('Hub does not have access');
      const data = { ...args, hubId: hub.id };
      return prisma.location.create({ ...query, data });
    },
  }),
}));
