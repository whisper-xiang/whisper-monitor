import { EventTypes } from "./constants";

export interface BreadcrumbItem {
  t: Date;
  type: EventTypes;
  data: any;
  [key: string]: any;
}
