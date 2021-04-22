import { makeSchema, mutationType, objectType, queryType } from "nexus"
import path from 'path'
import { nexusPrisma } from "nexus-plugin-prisma"

const rootDir = __dirname || process.cwd()

const schema = makeSchema({
    types: [
        queryType({
            definition(t) {
                t.crud.user()
            }
        }),
        mutationType({
            definition(t) {
                t.crud.createOneUser()
                t.crud.createOneHub()
                t.crud.createOneSensor()
                t.crud.createOneEvent()
            }
        }),
        objectType({
            name: 'User',
            definition(t) {
                t.model.id()
                t.model.email()
                t.model.firstName()
                t.model.lastName()
                t.model.hubs()
            }
        }),
        objectType({
            name: 'Hub',
            definition(t) {
                t.model.id()
                t.model.serial()
                t.model.batteryLevel()
                t.model.isCharging()
                t.model.owner()
            }
        }),
        objectType({
            name: 'Sensor',
            definition(t) {
                t.model.id()
                t.model.serial()
                t.model.batteryLevel()
                t.model.isOpen()
                t.model.isConnected()
                t.model.isArmed()
                t.model.doorColumn()
                t.model.doorRow()
                t.model.events()
            }
        }),
        objectType({
            name: 'Event',
            definition(t) {
                t.model.id()
                t.model.time()
                t.model.sensor()
            }
        })
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