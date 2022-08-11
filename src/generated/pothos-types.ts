import type { Prisma, User, Hub, Sensor, Event, Location, NetworkMember, Network, NotificationOverride, BatteryLevel, Vehicle } from "@prisma/client";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        Where: Prisma.UserWhereUniqueInput;
        Fields: "hubs" | "networkMemberships" | "notificationOverrides";
        RelationName: "hubs" | "networkMemberships" | "notificationOverrides";
        ListRelations: "hubs" | "networkMemberships" | "notificationOverrides";
        Relations: {
            hubs: {
                Shape: Hub[];
                Types: PrismaTypes["Hub"];
            };
            networkMemberships: {
                Shape: NetworkMember[];
                Types: PrismaTypes["NetworkMember"];
            };
            notificationOverrides: {
                Shape: NotificationOverride[];
                Types: PrismaTypes["NotificationOverride"];
            };
        };
    };
    Hub: {
        Name: "Hub";
        Shape: Hub;
        Include: Prisma.HubInclude;
        Select: Prisma.HubSelect;
        Where: Prisma.HubWhereUniqueInput;
        Fields: "owner" | "sensors" | "locations" | "notificationOverrides" | "batteryLevels" | "vehicle";
        RelationName: "owner" | "sensors" | "locations" | "notificationOverrides" | "batteryLevels" | "vehicle";
        ListRelations: "sensors" | "locations" | "notificationOverrides" | "batteryLevels";
        Relations: {
            owner: {
                Shape: User;
                Types: PrismaTypes["User"];
            };
            sensors: {
                Shape: Sensor[];
                Types: PrismaTypes["Sensor"];
            };
            locations: {
                Shape: Location[];
                Types: PrismaTypes["Location"];
            };
            notificationOverrides: {
                Shape: NotificationOverride[];
                Types: PrismaTypes["NotificationOverride"];
            };
            batteryLevels: {
                Shape: BatteryLevel[];
                Types: PrismaTypes["BatteryLevel"];
            };
            vehicle: {
                Shape: Vehicle | null;
                Types: PrismaTypes["Vehicle"];
            };
        };
    };
    Sensor: {
        Name: "Sensor";
        Shape: Sensor;
        Include: Prisma.SensorInclude;
        Select: Prisma.SensorSelect;
        Where: Prisma.SensorWhereUniqueInput;
        Fields: "hub" | "events";
        RelationName: "hub" | "events";
        ListRelations: "events";
        Relations: {
            hub: {
                Shape: Hub;
                Types: PrismaTypes["Hub"];
            };
            events: {
                Shape: Event[];
                Types: PrismaTypes["Event"];
            };
        };
    };
    Event: {
        Name: "Event";
        Shape: Event;
        Include: Prisma.EventInclude;
        Select: Prisma.EventSelect;
        Where: Prisma.EventWhereUniqueInput;
        Fields: "sensor";
        RelationName: "sensor";
        ListRelations: never;
        Relations: {
            sensor: {
                Shape: Sensor;
                Types: PrismaTypes["Sensor"];
            };
        };
    };
    Location: {
        Name: "Location";
        Shape: Location;
        Include: Prisma.LocationInclude;
        Select: Prisma.LocationSelect;
        Where: Prisma.LocationWhereUniqueInput;
        Fields: "hub";
        RelationName: "hub";
        ListRelations: never;
        Relations: {
            hub: {
                Shape: Hub;
                Types: PrismaTypes["Hub"];
            };
        };
    };
    NetworkMember: {
        Name: "NetworkMember";
        Shape: NetworkMember;
        Include: Prisma.NetworkMemberInclude;
        Select: Prisma.NetworkMemberSelect;
        Where: Prisma.NetworkMemberWhereUniqueInput;
        Fields: "user" | "network";
        RelationName: "user" | "network";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Types: PrismaTypes["User"];
            };
            network: {
                Shape: Network;
                Types: PrismaTypes["Network"];
            };
        };
    };
    Network: {
        Name: "Network";
        Shape: Network;
        Include: Prisma.NetworkInclude;
        Select: Prisma.NetworkSelect;
        Where: Prisma.NetworkWhereUniqueInput;
        Fields: "members";
        RelationName: "members";
        ListRelations: "members";
        Relations: {
            members: {
                Shape: NetworkMember[];
                Types: PrismaTypes["NetworkMember"];
            };
        };
    };
    NotificationOverride: {
        Name: "NotificationOverride";
        Shape: NotificationOverride;
        Include: Prisma.NotificationOverrideInclude;
        Select: Prisma.NotificationOverrideSelect;
        Where: Prisma.NotificationOverrideWhereUniqueInput;
        Fields: "user" | "hub";
        RelationName: "user" | "hub";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Types: PrismaTypes["User"];
            };
            hub: {
                Shape: Hub;
                Types: PrismaTypes["Hub"];
            };
        };
    };
    BatteryLevel: {
        Name: "BatteryLevel";
        Shape: BatteryLevel;
        Include: Prisma.BatteryLevelInclude;
        Select: Prisma.BatteryLevelSelect;
        Where: Prisma.BatteryLevelWhereUniqueInput;
        Fields: "hub";
        RelationName: "hub";
        ListRelations: never;
        Relations: {
            hub: {
                Shape: Hub | null;
                Types: PrismaTypes["Hub"];
            };
        };
    };
    Vehicle: {
        Name: "Vehicle";
        Shape: Vehicle;
        Include: Prisma.VehicleInclude;
        Select: Prisma.VehicleSelect;
        Where: Prisma.VehicleWhereUniqueInput;
        Fields: "hub";
        RelationName: "hub";
        ListRelations: never;
        Relations: {
            hub: {
                Shape: Hub;
                Types: PrismaTypes["Hub"];
            };
        };
    };
}