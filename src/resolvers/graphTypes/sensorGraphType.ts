import { builder } from '../../builder';

builder.prismaObject('Sensor', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    serial: t.exposeString('serial'),
    batteryLevel: t.float({
      nullable: true,
      description: 'Battery level from 0 - 100',
      select: {
        batteryLevels: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      resolve: (sensor) => sensor.batteryLevels?.at(0)?.percent,
    }),
    version: t.exposeString('version', { nullable: true }),
    latestVersion: t.string({
      resolve: () => process.env.SENSOR_CURRENT_FIRMWARE_VERSION ?? '0.1.0',
    }),
    isOpen: t.exposeBoolean('isOpen'),
    isConnected: t.exposeBoolean('isConnected'),
    doorColumn: t.exposeInt('doorColumn'),
    doorRow: t.exposeInt('doorRow'),
    hub: t.relation('hub'),
    events: t.relation('events', {
      query: {
        orderBy: [{ createdAt: 'desc' }],
      },
    }),
  }),
});
