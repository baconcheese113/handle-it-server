import { PrismaClient, User } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

async function getUser(authorization: string): Promise<User | null> {
    const splitAuthorization = authorization.split('Bearer ');
    if(splitAuthorization.length !== 2) return null
    const token = splitAuthorization[1]
    const stringId = jwt.verify(token, process.env.JWT_SECRET!) as string
    const id = Number.parseInt(stringId)
    console.log('stringId', stringId)
    if(!Number.isInteger(id)) return null
    return prisma.user.findFirst({where: { id }})
} 

export interface IContext {
    prisma: PrismaClient,
    user: User | null,
}

export interface IAuthContext extends IContext {
    user: User
}

export async function createContext({ req }: any): Promise<IContext> {
    const authorization = req.headers.authorization
    console.log('authorization', req.headers)
    const user = authorization ? await getUser(authorization) : null

    return { prisma, user }
}