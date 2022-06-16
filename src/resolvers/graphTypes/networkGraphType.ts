import { Hub } from "@prisma/client";
import { objectType } from "nexus";
import { IAuthContext } from "../../context";

export default objectType({
    name: 'Network',
    definition(t) {
        t.model.id()
        t.model.name()
        t.model.members()
        t.model.createdById()
        t.model.createdAt()
        t.nonNull.list.nonNull.field('hubs', {
            type: "Hub",
            resolve: async (network, _args, { prisma, user }: IAuthContext) => {
                const members = await prisma.networkMember.findMany({
                    where: {
                        networkId: network.id,
                        NOT: { OR: { inviteeAcceptedAt: null, inviterAcceptedAt: null } },
                    },
                    include: { user: { include: { hubs: true }}}
                })
                // TODO make sure user is part of this network
                const canAccess = members.some(m => m.userId === user.id)
                const hubs = members.reduce((hubList, mem) => [...hubList, ...mem.user.hubs], [] as Hub[])
                return canAccess ? hubs : []
            }
        })
    }
})
