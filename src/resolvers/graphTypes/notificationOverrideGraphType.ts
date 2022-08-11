import { builder } from '../../builder';

builder.prismaObject('NotificationOverride', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    userId: t.exposeInt('userId'),
    user: t.relation('user'),
    hubId: t.exposeInt('hubId'),
    hub: t.relation('hub'),
    isMuted: t.exposeBoolean('isMuted'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});
