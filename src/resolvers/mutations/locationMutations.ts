import { AuthenticationError } from "apollo-server-errors";
import { GraphQLNonNull, GraphQLFloat, GraphQLInt } from "graphql";
import { mutationField } from "nexus";
import { IContext } from "../../context";

export default mutationField((t) => {
    t.field('createLocation', {
        type: "Location",
        args: {
            lat: new GraphQLNonNull(GraphQLFloat),
            lng: new GraphQLNonNull(GraphQLFloat),
            hdop: new GraphQLNonNull(GraphQLFloat),
            speed: new GraphQLNonNull(GraphQLFloat),
            age: new GraphQLNonNull(GraphQLInt),
            course: new GraphQLNonNull(GraphQLFloat),
        },
        resolve(_root, args, { prisma, hub }: IContext) {
            if(!hub) throw new AuthenticationError("Hub does not have access")
            const data = {...args, hubId: hub.id }
            return prisma.location.create({ data })
        } 
    })
})