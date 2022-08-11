import { builder } from "../../builder"

builder.prismaObject('User', {
    fields: (t) => ({
        id: t.exposeInt('id'),
        email: t.exposeString('email'),
        firstName: t.exposeString('firstName', { nullable: true }),
        lastName: t.exposeString('lastName', { nullable: true }),
        defaultFullNotification: t.exposeBoolean('defaultFullNotification'),
        activatedAt: t.expose('activatedAt', {
            type: 'DateTime',
            nullable: true,
        }),
        // TODO filter this down to only relationships this member can view
        networkMemberships: t.relation('networkMemberships'),
        isMe: t.withAuth({ loggedIn: true }).boolean({
            resolve: (u, _args, { user }) => {
                return u.id === user.id
            }
        }),
        displayName: t.string({
            resolve: (user) => {
                if (user.firstName || user.lastName) {
                    return [user.firstName, user.lastName].join(' ')
                }
                return user.email
            }
        }),
        hubs: t.relation('hubs'),
        notificationOverrides: t.relation('notificationOverrides'),
    })
})
