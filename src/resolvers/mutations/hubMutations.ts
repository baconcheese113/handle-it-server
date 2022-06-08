import { Hub } from "@prisma/client";
import { AuthenticationError, UserInputError, ForbiddenError } from "apollo-server-errors";
import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { mutationField } from "nexus";
import { IContext } from "../../context";

export default mutationField((t) => {
    t.field('createHub', {
        type: "Hub",
        args: {
            name: new GraphQLNonNull(GraphQLString),
            serial: new GraphQLNonNull(GraphQLString),
        },
        resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            return prisma.hub.create({ data: { ...args, ownerId: user.id } })
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
            // Because Cascade delete doesn't appear to work correctly
            const sensorDels = hubToDelete.sensors.map(s => prisma.event.deleteMany({ where: { sensorId: s.id } }))

            const transactionRet = await prisma.$transaction([
                ...sensorDels,
                prisma.sensor.deleteMany({ where: { hubId: id } }),
                prisma.location.deleteMany({ where: { hubId: id } }),
                prisma.hub.delete({ where: { id }, include: { sensors: true } }),
            ])
            const deletedHub = transactionRet[transactionRet.length - 1] as Hub
            return deletedHub
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
            const hubId = Number.parseInt(id);
            const hubToUpdate = hub || await prisma.hub.findFirst({ where: { id: hubId, ownerId: user?.id } })
            if (!hubToUpdate) throw new UserInputError("Hub doesn't exist")
            return prisma.hub.update({ where: { id: hubToUpdate.id }, data: data as any })
        }
    })
})
