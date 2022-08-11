import { builder } from '../../builder';

builder.prismaObject('Location', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    lat: t.exposeFloat('lat'),
    lng: t.exposeFloat('lng'),
    hdop: t.exposeFloat('hdop'),
    speed: t.exposeFloat('speed'),
    age: t.exposeInt('age'),
    course: t.exposeFloat('course'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    fixedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (location) => new Date(location.createdAt.getTime() - location.age),
    }),
    hub: t.relation('hub'),
  }),
});
