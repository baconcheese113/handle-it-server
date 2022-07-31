import { objectType } from "nexus";

export default objectType({
    name: "Vehicle",
    definition(t) {
        t.model.id()
        t.model.carQueryId()
        t.model.year()
        t.model.makeId()
        t.model.modelName()
        t.model.modelTrim()
        t.model.modelBody()
        t.model.color()
        t.model.notes()
        t.model.hub()
        t.model.createdAt()
    }
})