import { RoleType } from "@prisma/client";
import { AuthenticationError, UserInputError } from "apollo-server-errors";
import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { mutationField, nonNull } from "nexus";
import { IContext } from "../../context";

export default mutationField((t) => {
    t.field('createNetwork', {
        type: "Network",
        args: {
            name: new GraphQLNonNull(GraphQLString),
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const existingNetwork = await prisma.network.findFirst({ where: { ...args, createdById: user.id } });
            if (existingNetwork) throw new UserInputError("Network with name already exists")
            return await prisma.network.create({
                data: {
                    ...args,
                    createdById: user.id,
                    members: {
                        create: {
                            userId: user.id,
                            role: RoleType.owner,
                            inviteeAcceptedAt: new Date(),
                            inviterAcceptedAt: new Date(),
                        }
                    }
                }
            })
        }
    })

    t.field('deleteNetwork', {
        type: "Network",
        args: {
            networkId: new GraphQLNonNull(GraphQLInt),
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const { networkId } = args
            const networkToDelete = await prisma.network.findFirst({ where: { id: networkId, members: { some: { userId: user.id, role: "owner" } } } })
            if (!networkToDelete) throw new UserInputError("User is not an owner of a network with specified networkId")
            return prisma.network.delete({ where: { id: networkId } })
        }
    })

    t.field('createNetworkMember', {
        type: "NetworkMember",
        args: {
            networkId: new GraphQLNonNull(GraphQLInt),
            email: new GraphQLNonNull(GraphQLString),
            role: nonNull("RoleType"),
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const { email, networkId, role } = args
            let existingUser = await prisma.user.findFirst({ where: { email } })
            if (!existingUser) existingUser = await prisma.user.create({ data: { email } })

            const existingMember = await prisma.networkMember.findFirst({ where: { networkId, user: { email: existingUser.email } } })
            const inviterAcceptedAt = existingMember?.inviterAcceptedAt ?? new Date().toISOString();
            if (existingMember) return prisma.networkMember.update({ where: { id: existingMember.id }, data: { role, inviterAcceptedAt } })

            return prisma.networkMember.create({ data: { networkId, role, userId: existingUser.id, inviterAcceptedAt } })
        }
    })

    t.field('declineNetworkMembership', {
        type: "User",
        args: {
            networkMemberId: new GraphQLNonNull(GraphQLInt),
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const { networkMemberId } = args
            const member = await prisma.networkMember.findFirst({ where: { id: networkMemberId, userId: user.id, inviteeAcceptedAt: null } })
            if (!member) throw new UserInputError("No network membership for this id is pending for this user")
            await prisma.networkMember.delete({ where: { id: member.id } })
            return prisma.user.findFirst({ where: { id: user.id } })
        }
    })

    t.field('acceptNetworkMembership', {
        type: "NetworkMember",
        args: {
            networkMemberId: new GraphQLNonNull(GraphQLInt),
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const { networkMemberId } = args
            const member = await prisma.networkMember.findFirst({ where: { id: networkMemberId, userId: user.id, inviteeAcceptedAt: null } })
            if (!member) throw new UserInputError("No network membership for this id is pending for this user")
            return prisma.networkMember.update({ where: { id: member.id }, data: { inviteeAcceptedAt: new Date() } })
        }
    })
})