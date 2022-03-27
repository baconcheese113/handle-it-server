import { makeSchema, mutationType, queryType, subscriptionType } from "nexus"
import path from 'path'
import { nexusPrisma } from "nexus-plugin-prisma"
import * as admin from 'firebase-admin'
import { IContext } from "./context"
import bcrypt from 'bcrypt'
import { AuthenticationError, ForbiddenError, UserInputError } from "apollo-server-errors"
import jwt from 'jsonwebtoken'
import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql"
import viewerGraphField from "./resolvers/query/viewerGraphType"
import hubGraphType from "./resolvers/query/hubGraphType"
import userGraphType from "./resolvers/query/userGraphType"
import sensorGraphType from "./resolvers/query/sensorGraphType"
import eventGraphType from "./resolvers/query/eventGraphType"

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),    
    })
})
const rootDir = __dirname || process.cwd()

const schema = makeSchema({
    types: [
        queryType({
            definition(t) {
                t.nonNull.field('viewer', {
                    type: viewerGraphField,
                    resolve(_root, _args, { user }: IContext) {
                        if(!user) throw new AuthenticationError("User does not have permission")
                        return user
                    }
                })
                t.nonNull.field('hubViewer', {
                    type: hubGraphType,
                    resolve(_root, _args, { hub }: IContext) {
                        if (!hub) throw new AuthenticationError("Hub does not have permission")
                        return hub
                    }
                })
            }
        }),
        mutationType({
            definition(t) {
                // TODO extend resolvers to check that user has permissions for crud event
                t.crud.createOneHub()

                t.field('updateUser', {
                    type: 'User',
                    args: {
                        firstName: GraphQLString,
                        lastName: GraphQLString,
                        defaultFullNotification: GraphQLBoolean,
                    },
                    async resolve(_root, args, { prisma, user }:IContext) {
                        if(!user) throw new AuthenticationError("User does not have access")
                        return prisma.user.update({ where: { id: user.id }, data: args })
                    }
                })
                t.field('sendNotification', {
                    type: 'Boolean',
                    async resolve() {
                        try{
                            const msgId = await admin.messaging().send({
                                data: {
                                    type: 'alert',
                                },
                                android: {
                                    priority: 'high',
                                },
                                token: process.env.TEST_DEVICE_TOKEN!
                            })
                            console.log('Successfully sent message: ', msgId)
                        } catch (err) {
                            console.log('Error sending message: ', err)
                        }
                        return true;
                    }
                }),
                t.field('registerWithPassword', {
                    type: 'String',
                    args: { 
                        email: new GraphQLNonNull(GraphQLString),
                        password: new GraphQLNonNull(GraphQLString),
                        fcmToken: new GraphQLNonNull(GraphQLString),
                        firstName: GraphQLString,
                        lastName: GraphQLString,
                    },
                    async resolve(_root, args, { prisma, user }: IContext) {
                        if(user) return jwt.sign(`User:${user.id}`, process.env.JWT_SECRET!);
                        const { email, password, firstName, lastName, fcmToken } = args
                        const hashedPassword = await bcrypt.hash(password, 10)
                        console.log('hashedPassword', hashedPassword)
                        const newUser = await prisma.user.create({ data: { email, firstName, lastName, password: hashedPassword, fcmToken }})

                        return jwt.sign(`User:${newUser.id}`, process.env.JWT_SECRET!)
                    }
                }),
                t.field('loginWithPassword', {
                    type: 'String',
                    args: { 
                        email: new GraphQLNonNull(GraphQLString),
                        password: new GraphQLNonNull(GraphQLString),
                        fcmToken: new GraphQLNonNull(GraphQLString),
                    },
                    async resolve(_root, args, { prisma, user }: IContext) {
                        if(user) return jwt.sign(`User:${user.id}`, process.env.JWT_SECRET!);
                        const { email, password, fcmToken } = args
                        const hashedPassword = await bcrypt.hash(password, 10)
                        console.log('hashedPassword', hashedPassword)
                        const foundUser = await prisma.user.findFirst({ where: {email}})
                        if (!foundUser) throw new AuthenticationError('User not found, unable to login')
                        const isCorrectPwd = await bcrypt.compare(password, foundUser.password)
                        if (!isCorrectPwd) throw new AuthenticationError('Password incorrect, unable to login')
                        await prisma.user.update({ where: { email }, data: { fcmToken }})

                        return jwt.sign(`User:${foundUser.id}`, process.env.JWT_SECRET!)
                    }
                })
                t.field('createEvent', {
                    type: "Event",
                    args: {
                        sensorId: new GraphQLNonNull(GraphQLID),
                    },
                    async resolve(_root, args, { prisma, hub }: IContext) {
                        if(!hub) throw new AuthenticationError("Hub does not have access")
                        const sensorId = Number.parseInt(args.sensorId)
                        const sensor = await prisma.sensor.findFirst({ where: { id: sensorId }, include: { hub: true }})
                        if(!sensor) throw new Error("Sensor not found")
                        console.log(`hub.id ${hub.id} and sensor.hub.id ${sensor.hubId}`)
                        if(hub.id !== sensor.hubId) throw new Error("Hub does not have access to sensor")
                        const owner = await prisma.user.findFirst({ where: { id: sensor.hub.ownerId }})
                        if(!owner) throw new Error("No owner found for hub")

                        try{
                            const msgId = await admin.messaging().send({
                                data: {
                                    type: 'alert',
                                },
                                android: {
                                    priority: 'high',
                                },
                                token: owner.fcmToken
                            })
                            console.log('Successfully sent message: ', msgId)
                        } catch (err) {
                            console.log('Error sending message: ', err)
                        }
                        return await prisma.event.create({ data: { sensorId }})
                    }
                })
                t.field('loginAsHub', {
                    type: 'String',
                    args: { 
                        userId: new GraphQLNonNull(GraphQLID),
                        serial: new GraphQLNonNull(GraphQLString),
                    },
                    async resolve(_root, args, { prisma, hub }: IContext) {
                        if(hub) return jwt.sign(`Hub:${hub.id}`, process.env.JWT_SECRET!)
                        const { serial } = args
                        const userId = Number.parseInt(args.userId)
                        if(!Number.isFinite(userId)) throw new Error("Invalid userId")
                        const connectedUser = await prisma.user.findFirst({ where: { id: userId }})
                        if(!connectedUser) throw new Error("User does not exist")
                        const serialHub = await prisma.hub.findFirst({ where: { serial }})
                        // if(serialHub) throw new Error("Hub already registered")
                        // if(listOfValidSerials.contains(serial)) throw new Error("Invalid serial")
                        const connectedHub = serialHub || await prisma.hub.create({ data: { name: "TempName", serial, ownerId: userId }})
                        return jwt.sign(`Hub:${connectedHub.id}`, process.env.JWT_SECRET!)
                    }
                })
                t.field('updateHub', {
                    type: "Hub",
                    args: {
                        id: GraphQLID,
                        name: GraphQLString,
                        batteryLevel: GraphQLInt,
                        isCharging: GraphQLBoolean,
                        isArmed: GraphQLBoolean,
                    },
                    async resolve(_root, args, { prisma, hub, user }: IContext) {
                        if(!hub && !user) throw new AuthenticationError("No access")
                        const { id, ...data } = args
                        const hubId = Number.parseInt(id);
                        const hubToUpdate = hub || await prisma.hub.findFirst({ where: { id: hubId, ownerId: user?.id }})
                        if(!hubToUpdate) throw new UserInputError("Hub doesn't exist")
                        return prisma.hub.update({ where: { id: hubToUpdate.id }, data })
                    }
                })
                t.field('deleteHub', {
                    type: "Hub",
                    args: {
                        id: new GraphQLNonNull(GraphQLID)
                    },
                    async resolve(_root, args, { prisma, user }: IContext) {
                        if(!user) throw new AuthenticationError("User does not have access")
                        const id = Number.parseInt(args.id);
                        const hubToDelete = await prisma.hub.findFirst({ where: { id }, include: { sensors: true }})
                        if(!hubToDelete) throw new UserInputError("Hub doesn't exist")
                        if(hubToDelete.ownerId !== user.id) throw new ForbiddenError("User does not have access")
                        // Because Cascade delete doesn't appear to work correctly
                        const sensorDels = hubToDelete.sensors.map(s => prisma.event.deleteMany({ where: { sensorId: s.id }}))

                        const transactionRet = await prisma.$transaction([
                            ...sensorDels,
                            prisma.sensor.deleteMany({ where: { hubId: id }}),
                            prisma.hub.delete({ where: { id }, include: { sensors: true }}),
                        ])
                        return transactionRet[transactionRet.length - 1]
                    }
                })
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
                        if(!hub) throw new AuthenticationError("Hub does not have access")
                        const { isConnected, isOpen, ...otherArgs } = args
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
                        if(!hub) throw new AuthenticationError("Hub does not have access")
                        const id = Number.parseInt(args.id)
                        const { isOpen } = args
                        const sensorToUpdate = await prisma.sensor.findFirst({ where: { id, hubId: hub.id }})
                        if(!sensorToUpdate) throw new UserInputError("Sensor doesn't exist")
                        if(sensorToUpdate.isOpen == isOpen) return sensorToUpdate
                        if(isOpen) {
                            const owner = await prisma.user.findFirst({ where: { id: hub.ownerId }})
                            if(!owner) throw new Error("Hub doesn't have an owner")
                            await prisma.event.create({ data: { sensorId: id }})
                            if(owner.defaultFullNotification && hub.isArmed) {
                                try{
                                    const msgId = await admin.messaging().send({
                                        data: {
                                            type: 'alert',
                                            title: `${hub.name} detected that a handle was pulled`,
                                            body: "Your phone wasn't detected nearby"
                                        },
                                        android: {
                                            priority: 'high',
                                        },
                                        token: owner.fcmToken,
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
            }
        }),
        userGraphType,
        hubGraphType,
        sensorGraphType,
        eventGraphType
    ],
    plugins: [nexusPrisma({shouldGenerateArtifacts: true, experimentalCRUD: true })],
    sourceTypes: {
        modules: [
            {
                module: '@prisma/client',
                alias: 'prisma'
            }
        ]
    },
    outputs: {
        typegen: path.join(rootDir, 'generated', 'nexus-typegen.ts'),
        schema: path.join(rootDir, 'generated', 'schema.graphql'),
    },
})

export { schema }