import { EventTypes } from "./constants";

export interface BreadcrumbItem {
  t: number;
  type: EventTypes;
  data: any;
  [key: string]: any;
}
