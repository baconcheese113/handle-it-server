import { AuthenticationError } from "apollo-server-errors";
import { GraphQLNonNull, GraphQLInt, GraphQLBoolean } from "graphql";
import { mutationField } from "nexus";
import { IContext } from "../../context";

export default mutationField((t) => {
    t.field('updateNotificationOverride', {
        type: "NotificationOverride",
        args: {
            hubId: new GraphQLNonNull(GraphQLInt),
            shouldMute: new GraphQLNonNull(GraphQLBoolean),
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (!user) throw new AuthenticationError("User does not have access")
            const { hubId, shouldMute } = args
            const existingSetting = await prisma.notificationOverride.findFirst({ where: { userId: user.id, hubId } })
            const data = { hubId, isMuted: shouldMute, userId: user.id }

            if (existingSetting) {
                return prisma.notificationOverride.update({ where: { id: existingSetting.id }, data })
            }
            return prisma.notificationOverride.create({ data })

        }
    })
})