import { AuthenticationError, UserInputError } from "apollo-server-errors"
import { builder } from "../../builder"

builder.mutationFields((t) => ({
    createVehicle: t.prismaField({
        type: "Vehicle",
        args: {
            hubId: t.arg.id({ required: true }),
            carQueryId: t.arg.string({ required: true }),
            year: t.arg.int({ required: true }),
            makeId: t.arg.string({ required: true }),
            modelName: t.arg.string({ required: true }),
            modelTrim: t.arg.string({ required: true }),
            modelBody: t.arg.string({ required: true }),
        },
        resolve: async (query, _root, args, { prisma, user }) => {
            if (!user) throw new AuthenticationError("User does not have access")
            const hubId = Number.parseInt(args.hubId as string)
            const existingVehicle = await prisma.vehicle.findFirst({
                where: {
                    hubId,
                    hub: { ownerId: user.id },
                }
            })
            if (existingVehicle) throw new UserInputError("Vehicle already exists for hub")
            return prisma.vehicle.create({ ...query, data: { ...args, hubId } })
        }
    }),
    updateVehicle: t.prismaField({
        type: "Vehicle",
        args: {
            id: t.arg.id({ required: true }),
            color: t.arg.string(),
            notes: t.arg.string(),
        },
        resolve: async (query, _root, args, { prisma, user }) => {
            if (!user) throw new AuthenticationError("User does not have access")
            const { id: rawId, ...data } = args
            const id = Number.parseInt(rawId as string)
            const existingVehicle = await prisma.vehicle.findFirst({
                where: {
                    id,
                    hub: { ownerId: user.id },
                }
            })
            if (!existingVehicle) throw new UserInputError("Vehicle doesn't exist")
            return prisma.vehicle.update({ ...query, where: { id }, data })
        }
    }),
    deleteVehicle: t.prismaField({
        type: "Vehicle",
        args: {
            id: t.arg.id({ required: true }),
        },
        resolve: async (query, _root, args, { prisma, user }) => {
            if (!user) throw new AuthenticationError("User does not have access")
            const id = Number.parseInt(args.id as string)
            const existingVehicle = await prisma.vehicle.findFirst({
                where: {
                    id,
                    hub: { ownerId: user.id },
                }
            })
            if (!existingVehicle) throw new UserInputError("Vehicle doesn't exist")
            return prisma.vehicle.delete({ ...query, where: { id } })
        }
    }),
}))