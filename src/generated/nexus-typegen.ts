/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */





declare global {
  interface NexusGenCustomOutputProperties<TypeName extends string> {
    crud: NexusPrisma<TypeName, 'crud'>
    model: NexusPrisma<TypeName, 'model'>
  }
}

declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  EventCreateInput: { // input type
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    sensor: NexusGenInputs['SensorCreateNestedOneWithoutEventsInput']; // SensorCreateNestedOneWithoutEventsInput!
    time?: NexusGenScalars['DateTime'] | null; // DateTime
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  EventCreateManySensorInput: { // input type
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    id?: number | null; // Int
    time?: NexusGenScalars['DateTime'] | null; // DateTime
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  EventCreateManySensorInputEnvelope: { // input type
    data?: NexusGenInputs['EventCreateManySensorInput'][] | null; // [EventCreateManySensorInput!]
    skipDuplicates?: boolean | null; // Boolean
  }
  EventCreateNestedManyWithoutSensorInput: { // input type
    connect?: NexusGenInputs['EventWhereUniqueInput'][] | null; // [EventWhereUniqueInput!]
    connectOrCreate?: NexusGenInputs['EventCreateOrConnectWithoutSensorInput'][] | null; // [EventCreateOrConnectWithoutSensorInput!]
    create?: NexusGenInputs['EventCreateWithoutSensorInput'][] | null; // [EventCreateWithoutSensorInput!]
    createMany?: NexusGenInputs['EventCreateManySensorInputEnvelope'] | null; // EventCreateManySensorInputEnvelope
  }
  EventCreateOrConnectWithoutSensorInput: { // input type
    create: NexusGenInputs['EventCreateWithoutSensorInput']; // EventCreateWithoutSensorInput!
    where: NexusGenInputs['EventWhereUniqueInput']; // EventWhereUniqueInput!
  }
  EventCreateWithoutSensorInput: { // input type
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    time?: NexusGenScalars['DateTime'] | null; // DateTime
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  EventWhereUniqueInput: { // input type
    id?: number | null; // Int
  }
  HubCreateInput: { // input type
    batteryLevel?: number | null; // Int
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    isCharging?: boolean | null; // Boolean
    name: string; // String!
    owner: NexusGenInputs['UserCreateNestedOneWithoutHubsInput']; // UserCreateNestedOneWithoutHubsInput!
    sensors?: NexusGenInputs['SensorCreateNestedManyWithoutHubInput'] | null; // SensorCreateNestedManyWithoutHubInput
    serial: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  HubCreateNestedOneWithoutSensorsInput: { // input type
    connect?: NexusGenInputs['HubWhereUniqueInput'] | null; // HubWhereUniqueInput
    connectOrCreate?: NexusGenInputs['HubCreateOrConnectWithoutSensorsInput'] | null; // HubCreateOrConnectWithoutSensorsInput
    create?: NexusGenInputs['HubCreateWithoutSensorsInput'] | null; // HubCreateWithoutSensorsInput
  }
  HubCreateOrConnectWithoutSensorsInput: { // input type
    create: NexusGenInputs['HubCreateWithoutSensorsInput']; // HubCreateWithoutSensorsInput!
    where: NexusGenInputs['HubWhereUniqueInput']; // HubWhereUniqueInput!
  }
  HubCreateWithoutSensorsInput: { // input type
    batteryLevel?: number | null; // Int
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    isCharging?: boolean | null; // Boolean
    name: string; // String!
    owner: NexusGenInputs['UserCreateNestedOneWithoutHubsInput']; // UserCreateNestedOneWithoutHubsInput!
    serial: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  HubWhereUniqueInput: { // input type
    id?: number | null; // Int
    serial?: string | null; // String
  }
  SensorCreateInput: { // input type
    batteryLevel?: number | null; // Int
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    doorColumn: number; // Int!
    doorRow: number; // Int!
    events?: NexusGenInputs['EventCreateNestedManyWithoutSensorInput'] | null; // EventCreateNestedManyWithoutSensorInput
    hub: NexusGenInputs['HubCreateNestedOneWithoutSensorsInput']; // HubCreateNestedOneWithoutSensorsInput!
    isArmed: boolean; // Boolean!
    isConnected: boolean; // Boolean!
    isOpen: boolean; // Boolean!
    serial: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  SensorCreateManyHubInput: { // input type
    batteryLevel?: number | null; // Int
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    doorColumn: number; // Int!
    doorRow: number; // Int!
    id?: number | null; // Int
    isArmed: boolean; // Boolean!
    isConnected: boolean; // Boolean!
    isOpen: boolean; // Boolean!
    serial: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  SensorCreateManyHubInputEnvelope: { // input type
    data?: NexusGenInputs['SensorCreateManyHubInput'][] | null; // [SensorCreateManyHubInput!]
    skipDuplicates?: boolean | null; // Boolean
  }
  SensorCreateNestedManyWithoutHubInput: { // input type
    connect?: NexusGenInputs['SensorWhereUniqueInput'][] | null; // [SensorWhereUniqueInput!]
    connectOrCreate?: NexusGenInputs['SensorCreateOrConnectWithoutHubInput'][] | null; // [SensorCreateOrConnectWithoutHubInput!]
    create?: NexusGenInputs['SensorCreateWithoutHubInput'][] | null; // [SensorCreateWithoutHubInput!]
    createMany?: NexusGenInputs['SensorCreateManyHubInputEnvelope'] | null; // SensorCreateManyHubInputEnvelope
  }
  SensorCreateNestedOneWithoutEventsInput: { // input type
    connect?: NexusGenInputs['SensorWhereUniqueInput'] | null; // SensorWhereUniqueInput
    connectOrCreate?: NexusGenInputs['SensorCreateOrConnectWithoutEventsInput'] | null; // SensorCreateOrConnectWithoutEventsInput
    create?: NexusGenInputs['SensorCreateWithoutEventsInput'] | null; // SensorCreateWithoutEventsInput
  }
  SensorCreateOrConnectWithoutEventsInput: { // input type
    create: NexusGenInputs['SensorCreateWithoutEventsInput']; // SensorCreateWithoutEventsInput!
    where: NexusGenInputs['SensorWhereUniqueInput']; // SensorWhereUniqueInput!
  }
  SensorCreateOrConnectWithoutHubInput: { // input type
    create: NexusGenInputs['SensorCreateWithoutHubInput']; // SensorCreateWithoutHubInput!
    where: NexusGenInputs['SensorWhereUniqueInput']; // SensorWhereUniqueInput!
  }
  SensorCreateWithoutEventsInput: { // input type
    batteryLevel?: number | null; // Int
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    doorColumn: number; // Int!
    doorRow: number; // Int!
    hub: NexusGenInputs['HubCreateNestedOneWithoutSensorsInput']; // HubCreateNestedOneWithoutSensorsInput!
    isArmed: boolean; // Boolean!
    isConnected: boolean; // Boolean!
    isOpen: boolean; // Boolean!
    serial: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  SensorCreateWithoutHubInput: { // input type
    batteryLevel?: number | null; // Int
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    doorColumn: number; // Int!
    doorRow: number; // Int!
    events?: NexusGenInputs['EventCreateNestedManyWithoutSensorInput'] | null; // EventCreateNestedManyWithoutSensorInput
    isArmed: boolean; // Boolean!
    isConnected: boolean; // Boolean!
    isOpen: boolean; // Boolean!
    serial: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  SensorEventsOrderByInput: { // input type
    time?: NexusGenEnums['SortOrder'] | null; // SortOrder
  }
  SensorWhereUniqueInput: { // input type
    id?: number | null; // Int
    serial?: string | null; // String
  }
  UserCreateNestedOneWithoutHubsInput: { // input type
    connect?: NexusGenInputs['UserWhereUniqueInput'] | null; // UserWhereUniqueInput
    connectOrCreate?: NexusGenInputs['UserCreateOrConnectWithoutHubsInput'] | null; // UserCreateOrConnectWithoutHubsInput
    create?: NexusGenInputs['UserCreateWithoutHubsInput'] | null; // UserCreateWithoutHubsInput
  }
  UserCreateOrConnectWithoutHubsInput: { // input type
    create: NexusGenInputs['UserCreateWithoutHubsInput']; // UserCreateWithoutHubsInput!
    where: NexusGenInputs['UserWhereUniqueInput']; // UserWhereUniqueInput!
  }
  UserCreateWithoutHubsInput: { // input type
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    email: string; // String!
    fcmToken: string; // String!
    firstName?: string | null; // String
    lastName?: string | null; // String
    password: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  UserWhereUniqueInput: { // input type
    email?: string | null; // String
    id?: number | null; // Int
  }
}

export interface NexusGenEnums {
  SortOrder: "asc" | "desc"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  DateTime: any
}

export interface NexusGenObjects {
  Event: { // root type
    id: number; // Int!
    time: NexusGenScalars['DateTime']; // DateTime!
  }
  Hub: { // root type
    batteryLevel?: number | null; // Int
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: number; // Int!
    isCharging?: boolean | null; // Boolean
    name: string; // String!
    serial: string; // String!
  }
  Mutation: {};
  Query: {};
  Sensor: { // root type
    batteryLevel?: number | null; // Int
    doorColumn: number; // Int!
    doorRow: number; // Int!
    id: number; // Int!
    isArmed: boolean; // Boolean!
    isConnected: boolean; // Boolean!
    isOpen: boolean; // Boolean!
    serial: string; // String!
  }
  User: { // root type
    email: string; // String!
    firstName?: string | null; // String
    id: number; // Int!
    lastName?: string | null; // String
  }
  Viewer: {};
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Event: { // field return type
    id: number; // Int!
    sensor: NexusGenRootTypes['Sensor']; // Sensor!
    time: NexusGenScalars['DateTime']; // DateTime!
  }
  Hub: { // field return type
    batteryLevel: number | null; // Int
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: number; // Int!
    isCharging: boolean | null; // Boolean
    name: string; // String!
    owner: NexusGenRootTypes['User']; // User!
    sensors: NexusGenRootTypes['Sensor'][]; // [Sensor!]!
    serial: string; // String!
  }
  Mutation: { // field return type
    createEvent: NexusGenRootTypes['Event'] | null; // Event
    createOneEvent: NexusGenRootTypes['Event']; // Event!
    createOneHub: NexusGenRootTypes['Hub']; // Hub!
    createOneSensor: NexusGenRootTypes['Sensor']; // Sensor!
    loginWithPassword: string | null; // String
    registerWithPassword: string | null; // String
    sendNotification: boolean | null; // Boolean
    updateUser: NexusGenRootTypes['User'] | null; // User
  }
  Query: { // field return type
    viewer: NexusGenRootTypes['Viewer']; // Viewer!
  }
  Sensor: { // field return type
    batteryLevel: number | null; // Int
    doorColumn: number; // Int!
    doorRow: number; // Int!
    events: NexusGenRootTypes['Event'][]; // [Event!]!
    hub: NexusGenRootTypes['Hub']; // Hub!
    id: number; // Int!
    isArmed: boolean; // Boolean!
    isConnected: boolean; // Boolean!
    isOpen: boolean; // Boolean!
    serial: string; // String!
  }
  User: { // field return type
    displayName: string; // String!
    email: string; // String!
    firstName: string | null; // String
    hubs: NexusGenRootTypes['Hub'][]; // [Hub!]!
    id: number; // Int!
    lastName: string | null; // String
  }
  Viewer: { // field return type
    hubs: NexusGenRootTypes['Hub'][]; // [Hub!]!
    user: NexusGenRootTypes['User']; // User!
  }
}

export interface NexusGenFieldTypeNames {
  Event: { // field return type name
    id: 'Int'
    sensor: 'Sensor'
    time: 'DateTime'
  }
  Hub: { // field return type name
    batteryLevel: 'Int'
    createdAt: 'DateTime'
    id: 'Int'
    isCharging: 'Boolean'
    name: 'String'
    owner: 'User'
    sensors: 'Sensor'
    serial: 'String'
  }
  Mutation: { // field return type name
    createEvent: 'Event'
    createOneEvent: 'Event'
    createOneHub: 'Hub'
    createOneSensor: 'Sensor'
    loginWithPassword: 'String'
    registerWithPassword: 'String'
    sendNotification: 'Boolean'
    updateUser: 'User'
  }
  Query: { // field return type name
    viewer: 'Viewer'
  }
  Sensor: { // field return type name
    batteryLevel: 'Int'
    doorColumn: 'Int'
    doorRow: 'Int'
    events: 'Event'
    hub: 'Hub'
    id: 'Int'
    isArmed: 'Boolean'
    isConnected: 'Boolean'
    isOpen: 'Boolean'
    serial: 'String'
  }
  User: { // field return type name
    displayName: 'String'
    email: 'String'
    firstName: 'String'
    hubs: 'Hub'
    id: 'Int'
    lastName: 'String'
  }
  Viewer: { // field return type name
    hubs: 'Hub'
    user: 'User'
  }
}

export interface NexusGenArgTypes {
  Hub: {
    sensors: { // args
      after?: NexusGenInputs['SensorWhereUniqueInput'] | null; // SensorWhereUniqueInput
      before?: NexusGenInputs['SensorWhereUniqueInput'] | null; // SensorWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
    }
  }
  Mutation: {
    createEvent: { // args
      sensorId: string; // ID!
      time: NexusGenScalars['DateTime']; // DateTime!
    }
    createOneEvent: { // args
      data: NexusGenInputs['EventCreateInput']; // EventCreateInput!
    }
    createOneHub: { // args
      data: NexusGenInputs['HubCreateInput']; // HubCreateInput!
    }
    createOneSensor: { // args
      data: NexusGenInputs['SensorCreateInput']; // SensorCreateInput!
    }
    loginWithPassword: { // args
      email: string; // String!
      fcmToken: string; // String!
      password: string; // String!
    }
    registerWithPassword: { // args
      email: string; // String!
      fcmToken: string; // String!
      firstName?: string | null; // String
      lastName?: string | null; // String
      password: string; // String!
    }
    updateUser: { // args
      firstName?: string | null; // String
      lastName?: string | null; // String
    }
  }
  Sensor: {
    events: { // args
      after?: NexusGenInputs['EventWhereUniqueInput'] | null; // EventWhereUniqueInput
      before?: NexusGenInputs['EventWhereUniqueInput'] | null; // EventWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
      orderBy?: NexusGenInputs['SensorEventsOrderByInput'][] | null; // [SensorEventsOrderByInput!]
    }
  }
  User: {
    hubs: { // args
      after?: NexusGenInputs['HubWhereUniqueInput'] | null; // HubWhereUniqueInput
      before?: NexusGenInputs['HubWhereUniqueInput'] | null; // HubWhereUniqueInput
      first?: number | null; // Int
      last?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}