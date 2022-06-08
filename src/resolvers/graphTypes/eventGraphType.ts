import { objectType } from "nexus";

export default objectType({
    name: "Event",
    definition(t) {
        t.model.id()
        t.model.sensor()
        t.model.createdAt()
    }
})