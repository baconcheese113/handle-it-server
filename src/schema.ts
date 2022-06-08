import { makeSchema, queryType } from "nexus"
import path from 'path'
import { nexusPrisma } from "nexus-plugin-prisma"
import * as admin from 'firebase-admin'
import { IContext } from "./context"
import { AuthenticationError } from "apollo-server-errors"
import viewerGraphField from "./resolvers/graphTypes/viewerGraphType"
import * as graphTypes from './resolvers/graphTypes'
import hubGraphType from "./resolvers/graphTypes/hubGraphType"
import * as mutations from './resolvers/mutations'

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
        mutations,
        graphTypes,
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