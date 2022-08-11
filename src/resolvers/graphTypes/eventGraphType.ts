import { builder } from '../../builder';

builder.prismaObject('Event', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    sensor: t.relation('sensor'),
    propagatedAt: t.expose('propagatedAt', {
      type: 'DateTime',
      nullable: true,
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});
