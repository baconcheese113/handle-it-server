/* eslint-disable */
import type { Prisma, User, Hub, Sensor, Event, Location, NetworkMember, Network, NotificationOverride, BatteryLevel, Vehicle } from "@prisma/client";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "hubs" | "networkMemberships" | "notificationOverrides";
        ListRelations: "hubs" | "networkMemberships" | "notificationOverrides";
        Relations: {
            hubs: {
                Shape: Hub[];
                Name: "Hub";
            };
            networkMemberships: {
                Shape: NetworkMember[];
                Name: "NetworkMember";
            };
            notificationOverrides: {
                Shape: NotificationOverride[];
                Name: "NotificationOverride";
            };
        };
    };
    Hub: {
        Name: "Hub";
        Shape: Hub;
        Include: Prisma.HubInclude;
        Select: Prisma.HubSelect;
        OrderBy: Prisma.HubOrderByWithRelationInput;
        WhereUnique: Prisma.HubWhereUniqueInput;
        Where: Prisma.HubWhereInput;
        Create: {};
        Update: {};
        RelationName: "owner" | "sensors" | "locations" | "notificationOverrides" | "batteryLevels" | "vehicle";
        ListRelations: "sensors" | "locations" | "notificationOverrides" | "batteryLevels";
        Relations: {
            owner: {
                Shape: User;
                Name: "User";
            };
            sensors: {
                Shape: Sensor[];
                Name: "Sensor";
            };
            locations: {
                Shape: Location[];
                Name: "Location";
            };
            notificationOverrides: {
                Shape: NotificationOverride[];
                Name: "NotificationOverride";
            };
            batteryLevels: {
                Shape: BatteryLevel[];
                Name: "BatteryLevel";
            };
            vehicle: {
                Shape: Vehicle | null;
                Name: "Vehicle";
            };
        };
    };
    Sensor: {
        Name: "Sensor";
        Shape: Sensor;
        Include: Prisma.SensorInclude;
        Select: Prisma.SensorSelect;
        OrderBy: Prisma.SensorOrderByWithRelationInput;
        WhereUnique: Prisma.SensorWhereUniqueInput;
        Where: Prisma.SensorWhereInput;
        Create: {};
        Update: {};
        RelationName: "hub" | "events";
        ListRelations: "events";
        Relations: {
            hub: {
                Shape: Hub;
                Name: "Hub";
            };
            events: {
                Shape: Event[];
                Name: "Event";
            };
        };
    };
    Event: {
        Name: "Event";
        Shape: Event;
        Include: Prisma.EventInclude;
        Select: Prisma.EventSelect;
        OrderBy: Prisma.EventOrderByWithRelationInput;
        WhereUnique: Prisma.EventWhereUniqueInput;
        Where: Prisma.EventWhereInput;
        Create: {};
        Update: {};
        RelationName: "sensor";
        ListRelations: never;
        Relations: {
            sensor: {
                Shape: Sensor;
                Name: "Sensor";
            };
        };
    };
    Location: {
        Name: "Location";
        Shape: Location;
        Include: Prisma.LocationInclude;
        Select: Prisma.LocationSelect;
        OrderBy: Prisma.LocationOrderByWithRelationInput;
        WhereUnique: Prisma.LocationWhereUniqueInput;
        Where: Prisma.LocationWhereInput;
        Create: {};
        Update: {};
        RelationName: "hub";
        ListRelations: never;
        Relations: {
            hub: {
                Shape: Hub;
                Name: "Hub";
            };
        };
    };
    NetworkMember: {
        Name: "NetworkMember";
        Shape: NetworkMember;
        Include: Prisma.NetworkMemberInclude;
        Select: Prisma.NetworkMemberSelect;
        OrderBy: Prisma.NetworkMemberOrderByWithRelationInput;
        WhereUnique: Prisma.NetworkMemberWhereUniqueInput;
        Where: Prisma.NetworkMemberWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "network";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
            };
            network: {
                Shape: Network;
                Name: "Network";
            };
        };
    };
    Network: {
        Name: "Network";
        Shape: Network;
        Include: Prisma.NetworkInclude;
        Select: Prisma.NetworkSelect;
        OrderBy: Prisma.NetworkOrderByWithRelationInput;
        WhereUnique: Prisma.NetworkWhereUniqueInput;
        Where: Prisma.NetworkWhereInput;
        Create: {};
        Update: {};
        RelationName: "members";
        ListRelations: "members";
        Relations: {
            members: {
                Shape: NetworkMember[];
                Name: "NetworkMember";
            };
        };
    };
    NotificationOverride: {
        Name: "NotificationOverride";
        Shape: NotificationOverride;
        Include: Prisma.NotificationOverrideInclude;
        Select: Prisma.NotificationOverrideSelect;
        OrderBy: Prisma.NotificationOverrideOrderByWithRelationInput;
        WhereUnique: Prisma.NotificationOverrideWhereUniqueInput;
        Where: Prisma.NotificationOverrideWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "hub";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
            };
            hub: {
                Shape: Hub;
                Name: "Hub";
            };
        };
    };
    BatteryLevel: {
        Name: "BatteryLevel";
        Shape: BatteryLevel;
        Include: Prisma.BatteryLevelInclude;
        Select: Prisma.BatteryLevelSelect;
        OrderBy: Prisma.BatteryLevelOrderByWithRelationInput;
        WhereUnique: Prisma.BatteryLevelWhereUniqueInput;
        Where: Prisma.BatteryLevelWhereInput;
        Create: {};
        Update: {};
        RelationName: "hub";
        ListRelations: never;
        Relations: {
            hub: {
                Shape: Hub | null;
                Name: "Hub";
            };
        };
    };
    Vehicle: {
        Name: "Vehicle";
        Shape: Vehicle;
        Include: Prisma.VehicleInclude;
        Select: Prisma.VehicleSelect;
        OrderBy: Prisma.VehicleOrderByWithRelationInput;
        WhereUnique: Prisma.VehicleWhereUniqueInput;
        Where: Prisma.VehicleWhereInput;
        Create: {};
        Update: {};
        RelationName: "hub";
        ListRelations: never;
        Relations: {
            hub: {
                Shape: Hub;
                Name: "Hub";
            };
        };
    };
}