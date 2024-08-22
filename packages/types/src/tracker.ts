import { EventTypes } from "./constants";
export interface ReportData<T> {
  type: EventTypes;
  timestamp: number;
  data: T;
}
