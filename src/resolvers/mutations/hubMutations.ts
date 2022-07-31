import { Hub } from "@prisma/client";
import { AuthenticationError, UserInputError, ForbiddenError } from "apollo-server-errors";
import { GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { mutationField } from "nexus";
import { IContext } from "../../context";

export default mutationField((t) => {
    t.field('createHub', {
        type: "Hub",
        args: {
            name: new GraphQLNonNull(GraphQLString),
            serial: new GraphQLNonNull(GraphQLString),
            imei: new GraphQLNonNull(GraphQLString),
        },
        resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const name = args.name.trim()
            return prisma.hub.create({ data: { ...args, name, ownerId: user.id } })
        }
    })
    t.field('deleteHub', {
        type: "Hub",
        args: {
            id: new GraphQLNonNull(GraphQLID)
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const id = Number.parseInt(args.id);
            const hubToDelete = await prisma.hub.findFirst({ where: { id }, include: { sensors: true } })
            if (!hubToDelete) throw new UserInputError("Hub doesn't exist")
            if (hubToDelete.ownerId !== user.id) throw new ForbiddenError("User does not have access")
            // Because Cascade SetNull doesn't appear to work correctly
            await prisma.batteryLevel.updateMany({ where: { hubId: id }, data: { hubId: null } })
            return prisma.hub.delete({ where: { id }, include: { sensors: true } })
        }
    })

    t.field('updateHub', {
        type: "Hub",
        args: {
            id: new GraphQLNonNull(GraphQLID),
            name: GraphQLString,
            batteryLevel: GraphQLInt,
            isCharging: GraphQLBoolean,
            isArmed: GraphQLBoolean,
        },
        async resolve(_root, args, { prisma, hub, user }: IContext) {
            if (!hub && !user) throw new AuthenticationError("No access")
            const { id, ...data } = args
            const name = args.name?.trim()
            const hubId = Number.parseInt(id);
            const hubToUpdate = hub || await prisma.hub.findFirst({ where: { id: hubId, ownerId: user?.id } })
            if (!hubToUpdate) throw new UserInputError("Hub doesn't exist")
            return prisma.hub.update({ where: { id: hubToUpdate.id }, data: { ...data, name } as any })
        }
    })

    t.field('updateHubBatteryLevel', {
        type: "Hub",
        description: "Volts should be between 0 - 1023, percent between 0 - 100",
        args: {
            volts: new GraphQLNonNull(GraphQLFloat),
            percent: new GraphQLNonNull(GraphQLFloat),
        },
        async resolve(_root, args, { prisma, hub }: IContext) {
            if (!hub) throw new AuthenticationError("No access")
            await prisma.batteryLevel.create({
                data: { ...args, hubId: hub.id }
            })
            return hub
        }
    })
})
