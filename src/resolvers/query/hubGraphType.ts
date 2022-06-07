import { objectType } from "nexus";

export default objectType({
    name: 'Hub',
    definition(t) {
        t.model.id()
        t.model.name()
        t.model.isCharging()
        t.model.batteryLevel()
        t.model.isArmed()
        t.model.owner()
        t.model.serial()
        t.nonNull.field('latestVersion', {
            type: 'Int',
            resolve: () => Number.parseInt(process.env.HUB_CURRENT_FIRMWARE_VERSION ?? "1")
        })
        t.model.createdAt()
        t.model.sensors()
        t.model.locations()
    }
})