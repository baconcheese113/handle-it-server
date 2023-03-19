import { RoleType } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';

import { builder } from '../../builder';

builder.mutationFields((t) => ({
  createNetwork: t.prismaField({
    type: 'Network',
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw new AuthenticationError('User does not have access');
      const name = args.name.trim();
      const existingNetwork = await prisma.network.findFirst({
        where: { name, createdById: user.id },
      });
      if (existingNetwork) throw new UserInputError('Network with name already exists');
      return await prisma.network.create({
        ...query,
        data: {
          name,
          createdById: user.id,
          members: {
            create: {
              userId: user.id,
              role: RoleType.owner,
              inviteeAcceptedAt: new Date(),
              inviterAcceptedAt: new Date(),
            },
          },
        },
      });
    },
  }),
  deleteNetwork: t.prismaField({
    type: 'Network',
    args: {
      networkId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw new AuthenticationError('User does not have access');
      const { networkId } = args;
      const networkToDelete = await prisma.network.findFirst({
        where: {
          id: networkId,
          members: { some: { userId: user.id, role: 'owner' } },
        },
      });
      if (!networkToDelete)
        throw new UserInputError('User is not an owner of a network with specified networkId');
      return prisma.network.delete({ ...query, where: { id: networkId } });
    },
  }),
  createNetworkMember: t.prismaField({
    type: 'NetworkMember',
    args: {
      networkId: t.arg.int({ required: true }),
      email: t.arg.string({ required: true }),
      role: t.arg({ type: RoleType, required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw new AuthenticationError('User does not have access');
      const { networkId, role } = args;
      const email = args.email.trim();
      let existingUser = await prisma.user.findFirst({ where: { email } });
      if (!existingUser) existingUser = await prisma.user.create({ data: { email } });

      const existingMember = await prisma.networkMember.findFirst({
        where: { networkId, user: { email: existingUser.email } },
      });
      const inviterAcceptedAt = existingMember?.inviterAcceptedAt ?? new Date().toISOString();
      if (existingMember)
        return prisma.networkMember.update({
          where: { id: existingMember.id },
          data: { role, inviterAcceptedAt },
        });

      return prisma.networkMember.create({
        ...query,
        data: { networkId, role, userId: existingUser.id, inviterAcceptedAt },
      });
    },
  }),
  deleteNetworkMember: t.prismaField({
    type: 'Network',
    args: {
      networkMemberId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw new AuthenticationError('User does not have access');
      const { networkMemberId } = args;
      const member = await prisma.networkMember.findFirst({
        where: {
          id: networkMemberId,
          OR: [
            { userId: user.id },
            {
              network: {
                members: {
                  some: {
                    userId: user.id,
                    role: 'owner',
                    NOT: [{ inviteeAcceptedAt: null }, { inviterAcceptedAt: null }],
                  },
                },
              },
            },
          ],
        },
      });
      if (!member)
        throw new UserInputError(
          'No active member at specified id in a network where requestor has Owner role',
        );
      const numOtherOwners = await prisma.networkMember.count({
        where: {
          networkId: member.networkId,
          role: 'owner',
          NOT: { id: networkMemberId },
        },
      });
      if (numOtherOwners === 0)
        throw new UserInputError('Unable to delete membership if only Owner');
      await prisma.networkMember.delete({ where: { id: networkMemberId } });
      return prisma.network.findFirst({
        ...query,
        rejectOnNotFound: true,
        where: { id: member.networkId },
      });
    },
  }),
  declineNetworkMembership: t.prismaField({
    type: 'Network',
    args: {
      networkMemberId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      // Can be called by the invitee if they were invited or the inviter if the user requested
      if (!user) throw new AuthenticationError('User does not have access');
      const { networkMemberId } = args;
      const member = await prisma.networkMember.findFirst({
        where: {
          id: networkMemberId,
          OR: [
            {
              // An invited user (this user) cancelling his request to a new network
              AND: [
                { inviterAcceptedAt: null },
                { userId: user.id },
                { NOT: [{ inviteeAcceptedAt: null }] },
              ],
            },
            {
              // A network owner cancelling his request to a potential member
              AND: [
                { inviteeAcceptedAt: null },
                { NOT: [{ userId: user.id }, { inviterAcceptedAt: null }] },
                { network: { members: { some: { userId: user.id, role: 'owner' } } } },
              ],
            },
          ],
        },
      });
      if (!member)
        throw new UserInputError('No network membership for this id is pending for this user');
      await prisma.networkMember.delete({ where: { id: member.id } });
      return prisma.network.findFirst({
        ...query,
        rejectOnNotFound: true,
        where: { id: member.networkId },
      });
    },
  }),
  acceptNetworkMembership: t.prismaField({
    type: 'Network',
    args: {
      networkMemberId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      // Can be called by the invitee if they were invited or the inviter if the user requested
      if (!user) throw new AuthenticationError('User does not have access');
      const { networkMemberId } = args;
      const member = await prisma.networkMember.findFirst({
        where: {
          id: networkMemberId,
          OR: [
            {
              // An invited user accepting himself to the network
              AND: [
                { inviteeAcceptedAt: null },
                { userId: user.id },
                { NOT: [{ inviterAcceptedAt: null }] },
              ],
            },
            {
              // A requested user being accepted by this user (an Owner of the network)
              AND: [
                { inviterAcceptedAt: null },
                { NOT: [{ userId: user.id }, { inviteeAcceptedAt: null }] },
                { network: { members: { some: { userId: user.id, role: 'owner' } } } },
              ],
            },
          ],
        },
      });
      if (!member)
        throw new UserInputError(
          'No network membership for this id is pending for this user or no access',
        );

      await prisma.networkMember.update({
        where: { id: member.id },
        data: {
          inviteeAcceptedAt: member.inviteeAcceptedAt ? undefined : new Date(),
          inviterAcceptedAt: member.inviterAcceptedAt ? undefined : new Date(),
        },
      });
      return prisma.network.findFirst({
        ...query,
        rejectOnNotFound: true,
        where: { id: member.networkId },
      });
    },
  }),
  requestNetworkMembership: t.prismaField({
    type: 'NetworkMember',
    args: {
      networkName: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw new AuthenticationError('User does not have access');
      const networkName = args.networkName.trim();
      const network = await prisma.network.findFirst({ where: { name: networkName } });
      if (!network) throw new UserInputError("Network doesn't exist");
      const existingMember = await prisma.networkMember.findFirst({
        where: { network: { id: network.id }, userId: user.id },
      });
      if (existingMember)
        throw new UserInputError('Membership already pending or active in this network');

      return prisma.networkMember.create({
        ...query,
        data: { inviteeAcceptedAt: new Date(), userId: user.id, networkId: network.id },
      });
    },
  }),
  updateNetworkMember: t.prismaField({
    type: 'NetworkMember',
    args: {
      networkMemberId: t.arg.int({ required: true }),
      role: t.arg({ type: RoleType }),
    },
    resolve: async (query, _root, args, { prisma, user }) => {
      if (!user) throw new AuthenticationError('User does not have access');
      const { networkMemberId, role } = args;
      const member = await prisma.networkMember.findFirst({
        where: {
          id: networkMemberId,
          network: { members: { some: { userId: user.id, role: 'owner' } } },
        },
      });
      if (!member)
        throw new UserInputError('No member with this ID in a network where user is owner');
      const data = {
        role: role ?? undefined,
      };
      return prisma.networkMember.update({ ...query, where: { id: networkMemberId }, data });
    },
  }),
}));
