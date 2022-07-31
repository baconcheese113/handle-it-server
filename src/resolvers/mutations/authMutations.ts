import { AuthenticationError } from "apollo-server-errors";
import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { mutationField } from "nexus";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { IContext } from "../../context";

export default mutationField((t) => {
    t.field('registerWithPassword', {
        type: 'String',
        args: {
            email: new GraphQLNonNull(GraphQLString),
            password: new GraphQLNonNull(GraphQLString),
            fcmToken: new GraphQLNonNull(GraphQLString),
            firstName: GraphQLString,
            lastName: GraphQLString,
        },
        async resolve(_root, args, { prisma, user }: IContext) {
            if (user) return jwt.sign(`User:${user.id}`, process.env.JWT_SECRET!)
            const data = {
                ...args,
                password: await bcrypt.hash(args.password, 10),
                email: args.email.trim(),
                firstName: args.firstName?.trim(),
                lastName: args.lastName?.trim(),
                activatedAt: new Date()
            }
            const newUser = await prisma.user.create({ data })

            return jwt.sign(`User:${newUser.id}`, process.env.JWT_SECRET!)
        }
    }),
        t.field('loginWithPassword', {
            type: 'String',
            args: {
                email: new GraphQLNonNull(GraphQLString),
                password: new GraphQLNonNull(GraphQLString),
                fcmToken: new GraphQLNonNull(GraphQLString),
            },
            async resolve(_root, args, { prisma, user }: IContext) {
                if (user) return jwt.sign(`User:${user.id}`, process.env.JWT_SECRET!);
                const { email, password, fcmToken } = args
                const hashedPassword = await bcrypt.hash(password, 10)
                console.log('hashedPassword', hashedPassword)
                const foundUser = await prisma.user.findFirst({ where: { email, NOT: { password: null } } })
                if (!foundUser) throw new AuthenticationError('User not found, unable to login')
                const isCorrectPwd = await bcrypt.compare(password, foundUser.password!)
                if (!isCorrectPwd) throw new AuthenticationError('Password incorrect, unable to login')
                await prisma.user.update({ where: { email }, data: { fcmToken } })

                return jwt.sign(`User:${foundUser.id}`, process.env.JWT_SECRET!)
            }
        })
    t.field('loginAsHub', {
        type: 'String',
        args: {
            userId: new GraphQLNonNull(GraphQLID),
            serial: new GraphQLNonNull(GraphQLString),
            imei: new GraphQLNonNull(GraphQLString),
        },
        async resolve(_root, args, { prisma, hub }: IContext) {
            if (hub) return jwt.sign(`Hub:${hub.id}`, process.env.JWT_SECRET!)
            const { serial, imei } = args
            const userId = Number.parseInt(args.userId)
            if (!Number.isFinite(userId)) throw new Error("Invalid userId")
            const connectedUser = await prisma.user.findFirst({ where: { id: userId } })
            if (!connectedUser) throw new Error("User does not exist")
            const serialHub = await prisma.hub.findFirst({ where: { serial } })
            // if(serialHub) throw new Error("Hub already registered")
            // if(listOfValidSerials.contains(serial)) throw new Error("Invalid serial")
            const connectedHub = serialHub || await prisma.hub.create({ data: { name: "TempName", serial, imei, ownerId: userId } })
            return jwt.sign(`Hub:${connectedHub.id}`, process.env.JWT_SECRET!)
        }
    })
})