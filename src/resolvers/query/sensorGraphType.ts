import { objectType } from "nexus";

export default objectType({
    name: "Sensor",
    definition(t) {
        t.model.id()
        t.model.serial()
        t.model.batteryLevel()
        t.model.isOpen()
        t.model.isConnected()
        t.model.isArmed()
        t.model.doorColumn()
        t.model.doorRow()
        t.model.hub()
        t.model.events({ordering: { createdAt: true } })
    }
})