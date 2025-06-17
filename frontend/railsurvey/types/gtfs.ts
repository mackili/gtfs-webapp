import { z } from "zod/v4";

export const routeTypeEnum = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "11",
    "12",
] as const;

export const shapesSchema = z.object({
    shapeId: z.string().max(255),
    shapePtLatLon: z.tuple([z.number(), z.number()]),
    shapePtSequence: z.int(),
    shapeDistTraveled: z.number().nullable(),
});

export type Shape = z.infer<typeof shapesSchema>;

export const routesSchema = z.object({
    routeId: z.string().max(255),
    agencyId: z.string().max(255),
    routeShortName: z.string().max(255).nullable(),
    routeLongName: z.string().nullable(),
    routeDesc: z.string().nullish(),
    routeType: z.enum(routeTypeEnum),
    routeUrl: z.url().nullish(),
    routeColor: z.string().nullish(),
    routeTextColor: z.string().nullish(),
    routeSortOrder: z.int().nullish(),
    continousPickup: z.int().gte(0).lte(3).nullish(),
    continousDropOff: z.int().gte(0).lte(3).nullish().nullish(),
    networkId: z.string().max(255).nullish(),
});

export const routeDetailsSchema = z.object({
    routeId: z.string(),
    agencyId: z.string().nullish(),
    agencyName: z.string().nullish(),
    routeShortName: z.string().max(255).nullish(),
    routeLongName: z.string().nullish(),
    routeDesc: z.string().nullish(),
    routeType: z.union([z.enum(routeTypeEnum), z.int()]).nullish(),
});

export type Route = z.infer<typeof routesSchema>;

export type RouteDetailsView = Route & {
    agency: { agencyName: string };
};

export type StopTimesForTrip = StopTimes & {
    stops: Stops & {
        parentStation: Stops;
    };
};

export const agencySchema = z.object({
    agencyId: z.string().max(255),
    agencyName: z.string(),
    agencyUrl: z.url(),
    agencyTimezone: z.string(),
    agencyLang: z.string().length(2).nullish(),
    agencyPhone: z.string().nullish(),
    agencyFareUrl: z.string().nullish(),
    agencyEmail: z.email().nullish(),
});

export type Agency = z.infer<typeof agencySchema>;

export const tripsSchema = z.object({
    tripId: z.string().max(255),
    routeId: z.string().max(255),
    serviceId: z.string().max(255),
    tripHeadsign: z.string().nullish(),
    tripShortName: z.string().nullish(),
    directionId: z.int().gte(0).lte(1).nullish(),
    blockId: z.string().nullish(),
    shapeId: z.string().max(255).nullish(),
    wheelchairAccessible: z.int().gte(0).lte(2).nullish(),
    bikesAllowed: z.int().gte(0).lte(2).nullish(),
});

export type Trips = z.infer<typeof tripsSchema>;

export type TripDetailsView = Trips & {
    calendar: Calendar & {
        calendarDates: CalendarDates;
    };
};

export const calendarSchema = z.object({
    serviceId: z.string().max(255),
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
    startDate: z.date(),
    endDate: z.date(),
});

export type Calendar = z.infer<typeof calendarSchema>;

export const calendarDatesSchema = z.object({
    serviceId: z.string().max(255),
    date: z.date(),
    exceptionType: z.int().gte(1).lte(2),
});

export type CalendarDates = z.infer<typeof calendarDatesSchema>;

export const frequenciesSchema = z.object({
    tripId: z.string(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    headwaySecs: z.int().positive(),
    exactTimes: z.int().gte(0).lte(1).nullish(),
});

export type Frequencies = z.infer<typeof frequenciesSchema>;

export const stopsSchema = z.object({
    stopId: z.string().max(255),
    stopCode: z.string().max(255).nullable(),
    stopName: z.string().nullable(),
    ttsStopName: z.string().nullish(),
    stopDesc: z.string().nullish(),
    stopLatLon: z.tuple([z.number(), z.number()]),
    zoneId: z.string().nullish(),
    stopUrl: z.url().nullish(),
    locationType: z.number().nullish(),
    parentStation: z.string().max(255).nullish(),
    stopTimezone: z.string().nullish(),
    wheelchairBoarding: z.number().nullish(),
    levelId: z.string().max(255).nullish(),
    platformCode: z.string().nullish(),
});

export type Stops = z.infer<typeof stopsSchema>;

export const stopTimesSchema = z.object({
    tripId: z.string().max(255),
    stopSequence: z.int().nonnegative(),
    arrivalTime: z.iso.datetime().nullable(),
    departureTime: z.iso.datetime().nullable(),
    arrivalTimeAddDays: z.int().default(0),
    departureTimeAddDays: z.int().default(0),
    stopId: z.string().max(255).nullable(),
    locationGroupId: z.string().max(255).nullable(),
    locationId: z.string().max(255).nullable(),
    stopHeadsign: z.string().nullish(),
    startPickupDropOffWindow: z.iso.datetime().nullish(),
    endPickupDropOffWindow: z.iso.datetime().nullish(),
    pickupType: z.int().gte(0).lte(3).nullish(),
    dropOffType: z.int().gte(0).lte(3).nullish(),
    continousPickup: z.int().gte(0).lte(3).nullish(),
    continousDropOff: z.int().gte(0).lte(3).nullish(),
    shapeDistTraveled: z.number().nonnegative().nullish(),
    timepoint: z.int().gte(0).lte(1).nullish(),
    pickupBookingRuleId: z.number().nullish(),
    dropOffBookingRuleId: z.number().nullish(),
});

export type StopTimes = z.infer<typeof stopTimesSchema>;
