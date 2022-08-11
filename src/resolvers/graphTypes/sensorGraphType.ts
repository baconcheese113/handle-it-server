import { builder } from "../../builder"

builder.prismaObject('Sensor', {
    fields: (t) => ({
        id: t.exposeInt('id'),
        serial: t.exposeString('serial'),
        batteryLevel: t.exposeInt('batteryLevel', { nullable: true }),
        isOpen: t.exposeBoolean('isOpen'),
        isConnected: t.exposeBoolean('isConnected'),
        doorColumn: t.exposeInt('doorColumn'),
        doorRow: t.exposeInt('doorRow'),
        hub: t.relation('hub'),
        events: t.relation('events', {
            query: {
                orderBy: [{ createdAt: 'desc' }],
            },
        })
    })
})