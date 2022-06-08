import { AuthenticationError } from "apollo-server-errors"
import { GraphQLString, GraphQLBoolean } from "graphql"
import { mutationField } from "nexus"
import { IContext } from "../../context"

export default mutationField((t) => {
    t.field('updateUser', {
        type: 'User',
        args: {
            firstName: GraphQLString,
            lastName: GraphQLString,
            defaultFullNotification: GraphQLBoolean,
        },
        async resolve(_root, args, { prisma, user }:IContext) {
            if(!user) throw new AuthenticationError("User does not have access")
            const data: any = args
            return prisma.user.update({ where: { id: user.id }, data })
        }
    })
})