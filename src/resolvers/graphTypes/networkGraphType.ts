import { objectType } from "nexus";

export default objectType({
    name: 'Network',
    definition(t) {
        t.model.id()
        t.model.name()
        t.model.members()
        t.model.createdById()
        t.model.createdAt()
    }
})
