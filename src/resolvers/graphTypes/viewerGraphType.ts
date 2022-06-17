import { objectType } from 'nexus'
import { IAuthContext } from '../../context'
import { Prisma } from '@prisma/client'

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
            args: {
                status: "NetworkMemberStatus",
            },
            resolve: async (_root, args, { prisma, user }: IAuthContext) => {
                const { status } = args
                let additionalArgs: Prisma.NetworkMemberWhereInput = {}
                if (status == "active") {
                    additionalArgs = { NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }] }
                } else if (status == "invited") {
                    additionalArgs = { inviteeAcceptedAt: null, NOT: { inviterAcceptedAt: null } }
                } else if (status == "requested") {
                    additionalArgs = { NOT: { inviteeAcceptedAt: null }, inviterAcceptedAt: null }
                }
                return prisma.network.findMany({ where: { members: { some: { userId: user.id, ...additionalArgs } } } })
            }
        })
        t.nonNull.field('latestSensorVersion', {
            type: 'String',
            resolve: () => process.env.SENSOR_CURRENT_FIRMWARE_VERSION ?? "0.0.0"
        })

    }
})