import { objectType } from 'nexus'
import { IAuthContext } from '../../context'

export default objectType({
    name: 'Viewer',
    definition(t) {
        t.nonNull.field('user', {
            type: "User",
            resolve: (_root, _args, { user }: IAuthContext) => {
                return user
            },
        })
        t.nonNull.list.nonNull.field('hubs', {
            type: "Hub",
            resolve: (_root, _args, { prisma, user }: IAuthContext) => {
                return prisma.hub.findMany({ where: { ownerId: user.id } })
            }
        })
        t.nonNull.list.nonNull.field('networks', {
            type: "Network",
            resolve: async (_root, _args, { prisma, user }: IAuthContext) => {
                return prisma.network.findMany({ where: { members: { some: { userId: user.id } } } })
            }
        })
        t.nonNull.field('latestSensorVersion', {
            type: 'String',
            resolve: () => process.env.SENSOR_CURRENT_FIRMWARE_VERSION ?? "0.0.0"
        })

    }
})