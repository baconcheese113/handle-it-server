import { objectType } from "nexus";

export default objectType({
    name: 'Location',
    definition(t) {
        t.model.id()
        t.model.lat({ description: "Latitude (in degrees)" })
        t.model.lng({ description: "Longitude (in degrees)" })
        t.model.hdop({ description: "Horizontal diminution of precision (in meters)" })
        t.model.speed({ description: "Speed in KMPH (always slight movement)" })
        t.model.age({ description: "Age of this location (in ms)" })
        t.model.course({ description: "Ground course (in degrees)" })
        t.model.createdAt()
        t.field('fixedAt', {
            type: 'DateTime',
            resolve: (location) => new Date(location.createdAt - location.age)
        })
        t.model.hub()
    }
})
