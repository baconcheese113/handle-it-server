import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const now = new Date().toISOString();

async function main() {
    const password = await bcrypt.hash("password", 10)

    const testy = await prisma.user.upsert({
        where: { email: 'test@user.com' },
        update: {},
        create: {
            email: 'test@user.com',
            activatedAt: now,
            firstName: "Testy",
            password,
            hubs: {
                create: {
                    name: "TestHub1",
                    serial: "TestHub1Serial",
                    imei: "TestHub1Imei",
                    locations: {
                        createMany: {
                            data: [
                                {
                                    age: 1400,
                                    course: 90,
                                    hdop: 20,
                                    lat: 39.7,
                                    lng: -104.9,
                                    speed: .30,
                                    createdAt: new Date(new Date().getTime() - 6000000)
                                },
                                {
                                    age: 1300,
                                    course: 110,
                                    hdop: 25,
                                    lat: 39.701,
                                    lng: -104.901,
                                    speed: .50,
                                    createdAt: new Date(new Date().getTime() - 7000000)
                                },
                            ]
                        }
                    },
                    sensors: {
                        create: {
                            doorColumn: 0,
                            doorRow: 0,
                            serial: "TestHub1Sensor1",
                            isConnected: false,
                            isOpen: false,
                            events: {
                                createMany: {
                                    data: [
                                        { createdAt: new Date(new Date().getTime() - 10000) },
                                        { createdAt: new Date(new Date().getTime() - 300000) },
                                    ]
                                }
                            }
                        },
                        createMany: {
                            data: [
                                {
                                    doorColumn: 1,
                                    doorRow: 0,
                                    serial: "TestHub1Sensor2",
                                    isConnected: false,
                                    isOpen: false,
                                }
                            ]
                        },
                    },
                }
            },
        },
    })

    const steve = await prisma.user.upsert({
        where: { email: 'steve@user.com' },
        update: {},
        create: {
            email: 'steve@user.com',
            activatedAt: now,
            firstName: "Steve",
            password,
            hubs: {
                create: {
                    name: "SteveHub1",
                    serial: "SteveHub1Serial",
                    imei: "SteveHub1Imei",
                    locations: {
                        createMany: {
                            data: [
                                {
                                    age: 900,
                                    course: 270,
                                    hdop: 30,
                                    lat: 39.69,
                                    lng: -104.8905,
                                    speed: .70,
                                    createdAt: new Date(new Date().getTime() - 20000)
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
                                    serial: "SteveHub1Sensor1",
                                    isConnected: false,
                                    isOpen: false,
                                },
                            ]
                        }
                    },
                }
            },
        },
    })
    const steveHub2 = await prisma.hub.create({
        data: {
            name: "SteveHub2",
            serial: "SteveHub2Serial",
            imei: "SteveHub2Imei",
            ownerId: steve.id,
            locations: {
                createMany: {
                    data: [
                        {
                            age: 2700,
                            course: 210,
                            hdop: 5,
                            lat: 39.669,
                            lng: -104.8901,
                            speed: .20,
                            createdAt: new Date(new Date().getTime() - 10000)
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
                            serial: "SteveHub2Sensor1",
                            isConnected: false,
                            isOpen: false,
                        },
                    ]
                }
            },
        }
    })

    const goob = await prisma.user.create({
        data: {
            email: "goob@user.com",
        }
    })
    const jewb = await prisma.user.create({
        data: {
            email: "jewb@user.com",
        }
    })
    const pube = await prisma.user.create({
        data: {
            email: "pube@user.com",
        }
    })
    const tube = await prisma.user.create({
        data: {
            email: "tube@user.com",
        }
    })
    const mood = await prisma.user.create({
        data: {
            email: "mood@user.com",
        }
    })
    const rude = await prisma.user.create({
        data: {
            email: "rude@user.com",
        }
    })

    const testNetwork1Name = "TestNetwork1"
    const testNetwork1 = await prisma.network.findFirst({ where: { name: testNetwork1Name } })
    if (!testNetwork1) {
        await prisma.network.create({
            data: {
                createdById: testy.id,
                name: testNetwork1Name,
                members: {
                    createMany: {
                        data: [
                            {
                                userId: testy.id,
                                inviteeAcceptedAt: now,
                                inviterAcceptedAt: now,
                                role: "owner",
                            },
                            {
                                userId: steve.id,
                                inviteeAcceptedAt: now,
                                inviterAcceptedAt: now,
                                role: "member"
                            }
                        ]
                    }
                }
            }
        })
    }
    const testNetwork2Name = "TestNetwork2"
    const testNetwork2 = await prisma.network.findFirst({ where: { name: testNetwork2Name } })
    if (!testNetwork2) {
        await prisma.network.create({
            data: {
                createdById: testy.id,
                name: testNetwork2Name,
                members: {
                    createMany: {
                        data: [
                            {
                                userId: testy.id,
                                inviteeAcceptedAt: now,
                                inviterAcceptedAt: now,
                                role: "owner",
                            },
                            {
                                userId: goob.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: jewb.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: pube.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: tube.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: mood.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: rude.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                        ]
                    }
                }
            }
        })
    }
    const steveNetworkName = "SteveNetwork"
    const steveNetwork = await prisma.network.findFirst({ where: { name: steveNetworkName } })
    if (!steveNetwork) {
        await prisma.network.create({
            data: {
                createdById: testy.id,
                name: steveNetworkName,
                members: {
                    createMany: {
                        data: [
                            {
                                userId: steve.id,
                                inviteeAcceptedAt: now,
                                inviterAcceptedAt: now,
                                role: "owner",
                            },
                            {
                                userId: goob.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: jewb.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: pube.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: tube.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: mood.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                            {
                                userId: rude.id,
                                inviterAcceptedAt: now,
                                role: "member",
                            },
                        ]
                    }
                }
            }
        })
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })