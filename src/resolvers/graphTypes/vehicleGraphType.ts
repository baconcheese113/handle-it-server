import { builder } from '../../builder';

builder.prismaObject('Vehicle', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    carQueryId: t.exposeString('carQueryId'),
    year: t.exposeInt('year'),
    makeId: t.exposeString('makeId'),
    modelName: t.exposeString('modelName'),
    modelTrim: t.exposeString('modelTrim'),
    modelBody: t.exposeString('modelBody'),
    color: t.exposeString('color', { nullable: true }),
    notes: t.exposeString('notes', { nullable: true }),
    hub: t.relation('hub'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});
