import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import PrismaTypes from './generated/pothos-types'
import ScopeAuth from '@pothos/plugin-scope-auth'
import { IAuthContext, IContext, prisma } from "./context"
import { GraphQLDateTime } from 'graphql-scalars'

export const builder = new SchemaBuilder<{
    Context: IContext;
    AuthScopes: { loggedIn: boolean }
    AuthContexts: { loggedIn: IAuthContext }
    PrismaTypes: PrismaTypes
    Scalars: {
        DateTime: {
            Input: Date
            Output: Date
        }
    }
}>({
    plugins: [ScopeAuth, PrismaPlugin],
    prisma: {
        client: prisma,
        exposeDescriptions: true,
    },
    scopeAuthOptions: {
        runScopesOnType: true,
    },
    authScopes: (context) => ({
        loggedIn: !!context.user || !!context.hub
    })
})

builder.addScalarType("DateTime", GraphQLDateTime, {})
