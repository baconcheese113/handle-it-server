import { AuthenticationError, UserInputError } from "apollo-server-errors";
import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { mutationField } from "nexus";
import { IContext } from "../../context";

export default mutationField((t) => {
    t.field('createVehicle', {
        type: "Vehicle",
        args: {
            hubId: new GraphQLNonNull(GraphQLID),
            carQueryId: new GraphQLNonNull(GraphQLString),
            year: new GraphQLNonNull(GraphQLInt),
            makeId: new GraphQLNonNull(GraphQLString),
            modelName: new GraphQLNonNull(GraphQLString),
            modelTrim: new GraphQLNonNull(GraphQLString),
            modelBody: new GraphQLNonNull(GraphQLString),
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const hubId = Number.parseInt(args.hubId)
            const existingVehicle = await prisma.vehicle.findFirst({
                where: {
                    hubId,
                    hub: { ownerId: user.id },
                }
            })
            if (existingVehicle) throw new UserInputError("Vehicle already exists for hub")
            return prisma.vehicle.create({ data: { ...args, hubId } })
        }
    })

    t.field('updateVehicle', {
        type: "Vehicle",
        args: {
            id: new GraphQLNonNull(GraphQLID),
            color: GraphQLString,
            notes: GraphQLString,
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const { id: rawId, ...data } = args
            const id = Number.parseInt(rawId)
            const existingVehicle = await prisma.vehicle.findFirst({
                where: {
                    id,
                    hub: { ownerId: user.id },
                }
            })
            if (!existingVehicle) throw new UserInputError("Vehicle doesn't exist")
            return prisma.vehicle.update({ where: { id }, data })
        }
    })

    t.field('deleteVehicle', {
        type: "Vehicle",
        args: {
            id: new GraphQLNonNull(GraphQLID),
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const id = Number.parseInt(args.id)
            const existingVehicle = await prisma.vehicle.findFirst({
                where: {
                    id,
                    hub: { ownerId: user.id },
                }
            })
            if (!existingVehicle) throw new UserInputError("Vehicle doesn't exist")
            return prisma.vehicle.delete({ where: { id } })
        }
    })

})