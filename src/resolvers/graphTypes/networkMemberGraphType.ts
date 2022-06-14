import { enumType, objectType } from "nexus";

const networkMemberStatus = enumType({
    name: "NetworkMemberStatus", members: {
        invited: "invited", // we invited them
        requested: "requested", // they requested to join us
        active: "active",
    }
})
export default objectType({
    name: 'NetworkMember',
    definition(t) {
        t.model.id()
        t.model.role()
        t.model.userId()
        t.model.user()
        t.model.networkId()
        t.model.network()
        t.model.inviteeAcceptedAt()
        t.model.inviterAcceptedAt()
        t.field('status', {
            type: networkMemberStatus,
            resolve: (networkMember) => {
                if (networkMember.inviteeAcceptedAt === null) return "invited"
                if (networkMember.inviterAcceptedAt === null) return "requested"
                return "active"
            }
        })
    }
})
