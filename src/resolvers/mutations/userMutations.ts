import { AuthenticationError, UserInputError } from "apollo-server-errors"
import bcrypt from 'bcrypt'
import { builder } from "../../builder"

builder.mutationFields((t) => ({
    updateUser: t.prismaField({
        type: 'User',
        args: {
            firstName: t.arg.string(),
            lastName: t.arg.string(),
            defaultFullNotification: t.arg.boolean(),
        },
        resolve: async (query, _root, args, { prisma, user }) => {
            if (!user) throw new AuthenticationError("User does not have access")
            const data: any = {
                ...args,
                firstName: args.firstName?.trim(),
                lastName: args.lastName?.trim(),
            }
            return prisma.user.update({ ...query, where: { id: user.id }, data })
        }
    }),
    seedUser: t.prismaField({
        type: 'User',
        args: {
            email: t.arg.string({ required: true }),
            firstName: t.arg.string(),
            lat: t.arg.float({ required: true }),
            lng: t.arg.float({ required: true }),
        },
        resolve: async (query, _root, args, { prisma, user }) => {
            if (!user?.isAdmin) throw new AuthenticationError("User does not have access")
            const { lat, lng } = args
            const email = args.email.trim()
            const existingUser = await prisma.user.findFirst({ where: { email } })
            if (!existingUser) throw new UserInputError(`User for ${email} doesn't exist`)
            const firstName = existingUser.firstName ?? args.firstName?.trim()
            if (!firstName) throw new UserInputError(`FirstName not provided and hasn't been set`)

            const password = await bcrypt.hash("password", 10)

            const seededUser = await prisma.user.update({
                ...query,
                where: { email },
                data: {
                    hubs: {
                        create: {
                            name: `${firstName}Hub1`,
                            serial: `${firstName}Hub1Serial`,
                            imei: `${firstName}Hub1Imei`,
                            locations: {
                                createMany: {
                                    data: [
                                        {
                                            age: Math.round(Math.random() * 10),
                                            course: Math.random() * 360,
                                            hdop: Math.random() * 100,
                                            lat: ((Math.random() - .5) / 10) + lat,
                                            lng: ((Math.random() - .5) / 10) + lng,
                                            speed: Math.random(),
                                            createdAt: new Date(new Date().getTime() - (Math.random() * 10000000))
                                        },
                                        {
                                            age: Math.round(Math.random() * 10),
                                            course: Math.random() * 360,
                                            hdop: Math.random() * 100,
                                            lat: ((Math.random() - .5) / 10) + lat,
                                            lng: ((Math.random() - .5) / 10) + lng,
                                            speed: Math.random(),
                                            createdAt: new Date(new Date().getTime() - (Math.random() * 10000000))
                                        },
                                    ]
                                }
                            },
                            sensors: {
                                createMany: {
                                    data: [
                                        {
                                            doorColumn: 0,
                                            doorRow: 0,
                                            serial: `${firstName}Hub1Sensor1`,
                                            isConnected: false,
                                            isOpen: false,
                                        },
                                        {
                                            doorColumn: 0,
                                            doorRow: 1,
                                            serial: `${firstName}Hub1Sensor2`,
                                            isConnected: false,
                                            isOpen: false,
                                        },
                                    ]
                                }
                            },
                        }
                    },
                    networkMemberships: {
                        create: {
                            inviteeAcceptedAt: new Date(),
                            inviterAcceptedAt: new Date(),
                            role: "owner",
                            network: {
                                create: {
                                    name: `${firstName}Net1`,
                                    createdById: existingUser.id,
                                }
                            }
                        }
                    }
                },
            })

            const newNetwork = await prisma.network.findFirst({ where: { name: `${firstName}Net1` } })

            await prisma.user.create({
                data: {
                    email: `not${firstName}1@user.com`,
                    activatedAt: new Date(),
                    fcmToken: "jibberish",
                    firstName: `Not${firstName}1`,
                    lastName: "User",
                    password,
                    hubs: {
                        create: {
                            name: `not${firstName}1Hub1`,
                            serial: `not${firstName}1Hub1Serial`,
                            imei: `not${firstName}1Hub1Imei`,
                            locations: {
                                create: {
                                    age: Math.round(Math.random() * 10),
                                    course: Math.random() * 360,
                                    hdop: Math.random() * 100,
                                    lat: ((Math.random() - .5) / 10) + lat,
                                    lng: ((Math.random() - .5) / 10) + lng,
                                    speed: Math.random(),
                                    createdAt: new Date(new Date().getTime() - (Math.random() * 10000000))
                                }
                            }
                        }
                    },
                    networkMemberships: {
                        create: {
                            networkId: newNetwork!.id,
                            inviteeAcceptedAt: new Date(),
                            inviterAcceptedAt: new Date(),
                            role: "owner",
                        }
                    }
                }
            })

            await prisma.user.create({
                data: {
                    email: `not${firstName}2@user.com`,
                    activatedAt: new Date(),
                    fcmToken: "jibberish",
                    firstName: `Not${firstName}2`,
                    lastName: "User",
                    password,
                    hubs: {
                        create: {
                            name: `not${firstName}2Hub1`,
                            serial: `not${firstName}2Hub1Serial`,
                            imei: `not${firstName}2Hub1Imei`,
                            locations: {
                                create: {
                                    age: Math.round(Math.random() * 10),
                                    course: Math.random() * 360,
                                    hdop: Math.random() * 100,
                                    lat: ((Math.random() - .5) / 10) + lat,
                                    lng: ((Math.random() - .5) / 10) + lng,
                                    speed: Math.random(),
                                    createdAt: new Date(new Date().getTime() - (Math.random() * 10000000))
                                }
                            }
                        }
                    },
                    networkMemberships: {
                        create: {
                            networkId: newNetwork!.id,
                            inviteeAcceptedAt: new Date(),
                            inviterAcceptedAt: new Date(),
                            role: "member",
                        }
                    }
                }
            })
            return seededUser
        }
    }),
}))