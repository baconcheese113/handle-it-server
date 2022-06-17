import { enumType, objectType } from "nexus";
import { IAuthContext } from "../../context";

const networkMemberStatus = enumType({
    name: "NetworkMemberStatus",
    members: {
        invited: "invited", // we invited them
        requested: "requested", // they requested to join us
        active: "active",
    },
})
export default objectType({
    name: 'NetworkMember',
    definition(t) {
        t.model.id()
        t.model.role()
        t.model.userId()
        t.model.user()
        t.model.networkId()
        t.model.network()
        t.model.inviteeAcceptedAt()
        t.model.inviterAcceptedAt()
        t.field('status', {
            type: networkMemberStatus,
            description: "Invited: network invited them.\n\rRequested: they requested to join network.\n\rActive: accepted on both sides into network",
            resolve: (networkMember) => {
                if (networkMember.inviteeAcceptedAt === null) return "invited"
                if (networkMember.inviterAcceptedAt === null) return "requested"
                return "active"
            }
        })
        t.nonNull.boolean('canDelete', {
            resolve: async (networkMember, _args, { prisma, user }: IAuthContext) => {
                const validMember = await prisma.networkMember.findFirst({where: {
                    id: networkMember.id,
                    OR: [
                        { userId: user.id },
                        {
                            network: {
                                members: {
                                    some: {
                                        userId: user.id,
                                        role: "owner",
                                        NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }],
                                    }
                                }
                            }
                        },
                    ]
                }})
                const numOtherOwners = await prisma.networkMember.count({where: {
                    networkId: networkMember.networkId,
                    role: "owner",
                    NOT: {id: networkMember.id},
                }})
                return !!validMember && !!numOtherOwners 
            }
        })
    }
})
