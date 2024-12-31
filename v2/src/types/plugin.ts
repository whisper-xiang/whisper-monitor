import { Core } from "..";
import { EventTypes } from "./constants";
import { ReportData } from "./tracker";
export interface Plugin {
  name: string;
  observer: (emit: (data: any) => void) => void;
  watcher: (this: Core, collectedData: CollectedType) => any;
  // watcher: (collectedData: any) => ReportData<any>;
}

export interface CollectedType {
  type: EventTypes;
  data: ErrorEvent | MouseEvent | any;
  [key: string]: any;
}
