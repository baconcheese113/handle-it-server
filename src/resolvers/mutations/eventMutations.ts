import { AuthenticationError, UserInputError } from "apollo-server-errors";
import { GraphQLNonNull, GraphQLString } from "graphql";
import { mutationField } from "nexus";
import { IContext } from "../../context";
import * as admin from 'firebase-admin';

export default mutationField((t) => {
    t.field('createEvent', {
        type: "Event",
        args: {
            serial: new GraphQLNonNull(GraphQLString),
        },
        async resolve(_root, args: { serial: string }, { prisma, hub }: IContext) {
            if (!hub) throw new AuthenticationError("Hub does not have access")
            const { serial } = args
            const sensor = await prisma.sensor.findFirst({ where: { serial, hubId: hub.id } });
            if (!sensor) throw new UserInputError("Sensor doesn't exist")
            const owner = await prisma.user.findFirst({ where: { id: hub.ownerId } })
            if (!owner) throw new Error("Hub doesn't have an owner")
            const createdEvent = await prisma.event.create({ data: { sensorId: sensor.id } })
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
            return createdEvent
        }
    })
})