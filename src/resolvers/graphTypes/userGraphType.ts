import { objectType } from "nexus";
import { IAuthContext } from "../../context";

export default objectType({
    name: "User",
    definition(t) {
        t.model.id()
        t.model.email()
        t.model.firstName()
        t.model.lastName()
        t.model.defaultFullNotification()
        t.model.activatedAt()
        t.model.networkMemberships()
        t.nonNull.field('isMe', {
            type: "Boolean",
            resolve: (u, _args, { user }: IAuthContext) => {
                return u.id === user.id
            }
        })
        t.nonNull.field('displayName', {
            type: "String",
            resolve: (user) => {
                if (user.firstName || user.lastName) {
                    return [user.firstName, user.lastName].join(' ')
                }
                return user.email
            }
        })
        t.model.hubs()
        t.model.notificationOverrides()
    }
})