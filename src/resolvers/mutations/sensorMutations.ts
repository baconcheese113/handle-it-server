import { AuthenticationError, UserInputError } from "apollo-server-errors";
import { GraphQLNonNull, GraphQLInt, GraphQLID, GraphQLBoolean } from "graphql";
import { mutationField } from "nexus";
import * as admin from 'firebase-admin'
import { IContext } from "../../context";

export default mutationField((t) => {
    t.field('createSensor', {
        type: "Sensor",
        args: {
            doorColumn: new GraphQLNonNull(GraphQLInt),
            doorRow: new GraphQLNonNull(GraphQLInt),
            serial: new GraphQLNonNull(GraphQLID),
            isConnected: GraphQLBoolean,
            isOpen: GraphQLBoolean,
            batteryLevel: GraphQLInt,
        },
        async resolve(_root, args, { prisma, hub }: IContext) {
            if (!hub) throw new AuthenticationError("Hub does not have access")
            const { isConnected, isOpen, ...otherArgs } = args
            // TODO ensure sensors only linked to a single hub
            // const serialSensor = await prisma.sensor.findFirst({ where: { serial: args.serial }})
            // if(serialSensor) throw new UserInputError("Sensor already added")
            return prisma.sensor.upsert({
                create: {
                    hubId: hub.id,
                    isConnected: !!isConnected,
                    isOpen: !!isOpen,
                    ...otherArgs
                },
                update: {
                    isConnected: !!isConnected,
                    isOpen: !!isOpen,
                    ...otherArgs
                },
                where: {
                    serial: args.serial,
                }
            })
        }
    })
    t.field('updateSensor', {
        type: "Sensor",
        args: {
            id: new GraphQLNonNull(GraphQLID),
            isOpen: GraphQLBoolean,
        },
        async resolve(_root, args, { prisma, hub }: IContext) {
            if (!hub) throw new AuthenticationError("Hub does not have access")
            const id = Number.parseInt(args.id)
            const isOpen = args.isOpen ?? undefined;
            const sensorToUpdate = await prisma.sensor.findFirst({ where: { id, hubId: hub.id } })
            if (!sensorToUpdate) throw new UserInputError("Sensor doesn't exist")
            if (sensorToUpdate.isOpen === isOpen) return sensorToUpdate
            if (isOpen) {
                const owner = await prisma.user.findFirst({ where: { id: hub.ownerId } })
                if (!owner) throw new Error("Hub doesn't have an owner")
                await prisma.event.create({ data: { sensorId: id } })
                if (owner.defaultFullNotification && hub.isArmed) {
                    try {
                        const msgId = await admin.messaging().send({
                            data: {
                                type: 'alert',
                                title: `${hub.name} detected that a handle was pulled`,
                                body: "Your phone wasn't detected nearby"
                            },
                            android: {
                                priority: 'high',
                            },
                            token: owner.fcmToken!,
                        })
                        console.log('Successfully sent message: ', msgId)
                    } catch (err) {
                        console.log('Error sending message: ', err)
                    }
                }
            }
            return prisma.sensor.update({ where: { id }, data: { ...sensorToUpdate, isOpen } })
        }
    })
})