import { objectType } from "nexus";
import { IAuthContext } from "../../context";

export default objectType({
    name: 'Hub',
    definition(t) {
        t.model.id()
        t.model.name()
        t.model.isCharging()
        t.field('batteryLevel', {
            type: 'Float',
            description: 'Battery level from 0 - 100',
            resolve: async (hub, _args, { prisma }: IAuthContext) => {
                const batteryLevels = await prisma.batteryLevel.findMany({ where: { hubId: hub.id }, orderBy: { createdAt: "desc" }, take: 1 })
                if (!batteryLevels.length) return null;
                return batteryLevels[0].percent;
            }
        })
        t.model.isArmed()
        t.model.ownerId()
        t.model.owner()
        t.model.serial()
        t.nonNull.field('latestVersion', {
            type: 'Int',
            resolve: () => Number.parseInt(process.env.HUB_CURRENT_FIRMWARE_VERSION ?? "1")
        })
        t.model.createdAt()
        t.model.vehicle()
        t.model.sensors()
        t.model.locations()
        t.nonNull.list.nonNull.field('events', {
            type: "Event",
            resolve: (hub, _args, { prisma }: IAuthContext) => {
                return prisma.event.findMany({ where: { sensor: { hubId: hub.id } } })
            }
        })
        t.nonNull.list.nonNull.field('networks', {
            type: "Network",
            resolve: async (hub, _args, { prisma, user }: IAuthContext) => {
                const networkMemberships = await prisma.networkMember.findMany({
                    where: {
                        userId: hub.ownerId,
                        NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }],
                    },
                    include: { network: true }
                })
                const theirHubNetworks = networkMemberships.map(mem => mem.network)
                const userNetworkMemberships = await prisma.networkMember.findMany({
                    where: {
                        userId: user.id,
                        NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }],
                    },
                    include: { network: true }
                })
                const userNetworkIds = new Set(userNetworkMemberships.map(mem => mem.network.id))
                // Only return networks I can see
                return theirHubNetworks.filter(n => userNetworkIds.has(n.id))
            }
        })
        t.field('notificationOverride', {
            type: "NotificationOverride",
            resolve: (hub, _args, { prisma, user }: IAuthContext) => {
                return prisma.notificationOverride.findFirst({ where: { userId: user.id, hubId: hub.id } })
            }
        })
    }
})