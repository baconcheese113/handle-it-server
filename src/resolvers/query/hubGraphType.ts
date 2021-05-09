import { objectType } from "nexus";

export default objectType({
    name: 'Hub',
    definition(t) {
        t.model.id()
        t.model.isCharging()
        t.model.batteryLevel()
        t.model.owner()
        t.model.serial()
        t.model.createdAt()
        t.model.sensors()
    }
})