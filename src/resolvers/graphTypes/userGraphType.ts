import { objectType } from "nexus";

export default objectType({
    name: "User",
    definition(t) {
        t.model.id()
        t.model.email()
        t.model.firstName()
        t.model.lastName()
        t.model.defaultFullNotification()
        t.nonNull.field('displayName', {
            type: "String",
            resolve: (user) => {
                if(user.firstName || user.lastName) {
                    return [user.firstName, user.lastName].join(' ')
                }
                return user.email
            }
        })
        t.model.hubs()
    }
})