import { z } from "zod/v4";
import { routeTypeEnum } from "./gtfs";

export const vehiclePositionsSchema = z.object({
    oid: z.string(),
    tripTripId: z.string().nullable(),
    tripRouteId: z.string().nullable(),
    tripStartTime: z.string().nullable(),
    tripStartDate: z.string().nullable(),
    stopId: z.string().nullable(),
    vehicleId: z.string().nullable(),
    vehicleLabel: z.string().nullable(),
    positionLatitude: z.number().nullable(),
    positionLongitude: z.number().nullable(),
    positionEaring: z.number().nullable(),
    positionSpeed: z.number().nullable(),
    occupancyStatus: z.string().nullable(),
    currentStopSequence: z.number().nullable(),
    currentStatus: z.string().nullable(),
    timestamp: z.date().nullable(),
});

export type VehiclePosition = z.infer<typeof vehiclePositionsSchema>;

export const entitySelectorsSchema = z.object({
    oid: z.string().max(255),
    agencyId: z.string().max(255).nullable(),
    routeId: z.string().max(255).nullable(),
    stopId: z.string().max(255).nullable(),
    routeType: z.enum(routeTypeEnum).nullable(),
    tripId: z.string().max(255).nullable(),
    tripRouteId: z.string().max(255).nullable(),
    tripStartTime: z.string().max(255).nullable(),
    tripStartDate: z.string().max(255).nullable(),
    alertId: z.string().max(255).nullable(),
});

export type EntitySelector = z.infer<typeof entitySelectorsSchema>;

export const stopTimeUpdateSchema = z.object({
    oid: z.string().max(255),
    stopSequence: z.int().nonnegative(),
    stopId: z.string().max(255),
    arrivalDelay: z.number(),
    arrivalTime: z.iso.datetime(),
    arribalUncertainty: z.number(),
    departureDelay: z.number(),
    departureTime: z.iso.datetime(),
    departureUncertainty: z.number(),
    scheduleRelationship: z.string().max(255),
    tripUpdateId: z.string().max(255),
});

export type StopTimeUpdate = z.infer<typeof stopTimeUpdateSchema>;

export const scheduleRelationshipEnum = [
    "Scheduled",
    "Added",
    "Unscheduled",
    "Canceled",
    "Duplicated",
] as const;

export const tripUpdateSchema = z.object({
    oid: z.string().max(255),
    tripId: z.string().max(255),
    routeId: z.string().max(255),
    scheduleRelationship: z.enum(scheduleRelationshipEnum),
    vehicleId: z.string().max(255),
    vehicleLabel: z.string().max(255),
    delay: z.int(),
    timestamp: z.iso.datetime(),
});

export type TripUpdate = z.infer<typeof tripUpdateSchema>;

export const severityLevelEnum = [
    "UNKNOWN_SEVERITY",
    "INFO",
    "WARNING",
    "SEVERE",
] as const;
export const causeEnum = [
    "UNKNOWN_CAUSE",
    "OTHER_CAUSE",
    "TECHNICAL_PROBLEM",
    "STRIKE",
    "DEMONSTRATION",
    "ACCIDENT",
    "HOLIDAY",
    "WEATHER",
    "MAINTENANCE",
    "CONSTRUCTION",
    "POLICE_ACTIVITY",
    "MEDICAL_EMERGENCY",
] as const;

export const effectEnum = [
    "NO_SERVICE",
    "REDUCED_SERVICE",
    "SIGNIFICANT_DELAYS",
    "DETOUR",
    "ADDITIONAL_SERVICE",
    "MODIFIED_SERVICE",
    "OTHER_EFFECT",
    "UNKNOWN_EFFECT",
    "STOP_MOVED",
    "NO_EFFECT",
    "ACCESSIBILITY_ISSUE",
] as const;

export const alertSchema = z.object({
    oid: z.string().max(255),
    activePeriod: z.json(),
    cause: z.enum(causeEnum),
    effect: z.enum(effectEnum),
    url: z.url(),
    descriptionText: z.string(),
    severityLevel: z.enum(severityLevelEnum),
    urlTranslation: z.json(),
    headerTextTranslation: z.json(),
    descriptionTextTranslation: z.json(),
});

export type Alert = z.infer<typeof alertSchema>;

export const realtimeSourceAgencySchema = z.object({
    id: z.union([z.string(), z.int()]).nullish(),
    realtimeSourceId: z.union([z.string(), z.int()]).nullish(),
    agencyId: z.union([z.string(), z.int()]),
    uuid: z.string().optional(),
});

export type RealtimeSourceAgency = z.infer<typeof realtimeSourceAgencySchema>;

export const realtimeSourceSchema = z.object({
    id: z.union([z.string(), z.coerce.number().int()]).nullish(),
    url: z.string().nullish().optional(),
    write: z.preprocess((value) => {
        return value === "true";
    }, z.boolean()),
    verbose: z.preprocess((value) => {
        return value === "true";
    }, z.boolean()),
    batchSize: z.coerce.number().int().default(200),
    active: z.preprocess((value) => {
        return value === "true";
    }, z.boolean().default(false)),
    refreshPeriod: z.coerce.number().int().min(30).nullish(),
});

export type RealtimeSource = z.infer<typeof realtimeSourceSchema>;

export const realtimeSourceResultSchema = realtimeSourceSchema.extend({
    agencies: z.array(realtimeSourceAgencySchema),
});

export const realtimeSourceResultSchemaArray = z.array(
    realtimeSourceResultSchema
);

export type RealtimeSourceResult = z.infer<typeof realtimeSourceResultSchema>;

export const tripUpdateResultSchema = z.object({
    oid: z.string(),
    tripId: z.string(),
    scheduleRelationship: z.string().nullable(),
    vehicleId: z.string().nullable(),
    vehicleLabel: z.string().nullable(),
    vehicleLicensePlate: z.string().nullable(),
    timestamp: z.string().nullable(),
    delay: z.int().nullable(),
    stopTimeUpdates: z.array(
        z.object({
            oid: z.string(),
            stopId: z.string().nullable(),
            stopSequence: z.int().nullable(),
            arrivalTime: z.iso.datetime().nullable(),
            departureTime: z.iso.datetime().nullable(),
            arrivalUncertainty: z.coerce.number().int().nullable(),
            departureUncertainty: z.coerce.number().int().nullable(),
            arrivalDelay: z.coerce.number().int().nullable(),
            departureDelay: z.coerce.number().int().nullable(),
            scheduleRelationship: z.string().nullable(),
        })
    ),
});

export type TripUpdateResult = z.infer<typeof tripUpdateResultSchema>;
