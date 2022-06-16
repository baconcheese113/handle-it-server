import { objectType } from "nexus";

export default objectType({
    name: "NotificationOverride",
    definition(t) {
        t.model.id()
        t.model.userId()
        t.model.user()
        t.model.hubId()
        t.model.hub()
        t.model.isMuted()
        t.model.createdAt()
    },
})