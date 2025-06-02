import { Agency } from "@/types/gtfs";

export interface SummaryData extends Agency {
  statistics: Array<AgencyStatic> | null;
}

export type AgencyStatic = {
  id: string;
  title: string;
  value: string | number;
};

export interface AgencySummaryView extends Agency {
  routeCount: number;
  tripCount: number;
  alertCount: number;
}
