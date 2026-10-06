export type OutcomeSummary = {
  period: string;
  completedPassengerTripsAttributedToUARoute: number;
  excludedTests: number;
  groups: Array<{
    origin: string;
    destination: string;
    source: string;
    direction: string;
    completedPassengerTrips: number;
    travelledUnknown: number;
    [key: string]: unknown;
  }>;
  limitation: string;
};
export function summarizeOutcomes(input: unknown): OutcomeSummary;
