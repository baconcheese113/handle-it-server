import { RoleType } from "@prisma/client"
import { builder } from "../../builder"

export enum NetworkMemberStatus {
    invited, // we invited them
    requested, // they requested to join us
    active,
}

builder.enumType(NetworkMemberStatus, {
    name: 'NetworkMemberStatus',
})

builder.enumType(RoleType, {
    name: 'RoleType',
})

builder.prismaObject('NetworkMember', {
    fields: (t) => ({
        id: t.exposeInt('id'),
        role: t.expose('role', { type: RoleType }),
        userId: t.exposeInt('userId'),
        user: t.relation('user'),
        networkId: t.exposeInt('networkId'),
        network: t.relation('network'),
        inviteeAcceptedAt: t.expose('inviteeAcceptedAt', {
            type: 'DateTime',
            nullable: true,
        }),
        inviterAcceptedAt: t.expose('inviterAcceptedAt', {
            type: 'DateTime',
            nullable: true,
        }),
        status: t.field({
            type: NetworkMemberStatus,
            description: "Invited: network invited them.\n\rRequested: they requested to join network.\n\rActive: accepted on both sides into network",
            resolve: (networkMember) => {
                if (networkMember.inviteeAcceptedAt === null) return NetworkMemberStatus.invited
                if (networkMember.inviterAcceptedAt === null) return NetworkMemberStatus.requested
                return NetworkMemberStatus.active
            }
        }),
        canDelete: t.withAuth({ loggedIn: true }).boolean({
            resolve: async (networkMember, _args, { prisma, user }) => {
                const validMember = await prisma.networkMember.findFirst({
                    where: {
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
                    }
                })
                const numOtherOwners = await prisma.networkMember.count({
                    where: {
                        networkId: networkMember.networkId,
                        role: "owner",
                        NOT: { id: networkMember.id },
                    }
                })
                return !!validMember && !!numOtherOwners
            }
        })
    })
})
