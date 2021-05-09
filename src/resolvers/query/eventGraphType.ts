import { objectType } from "nexus";

export default objectType({
    name: "Event",
    definition(t) {
        t.model.id()
        t.model.time()
        t.model.sensor()
    }
})