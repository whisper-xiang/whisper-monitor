import { BreadcrumbItem } from "./breadcrumb";
import { EventTypes } from "./constants";
export interface ReportData<T> {
  type: EventTypes;
  timestamp: number;
  deviceInfo: Window["deviceInfo"];
  data: T;
  breadcrumb: BreadcrumbItem[];
}
