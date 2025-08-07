import { Core } from "..";
import { EventTypes } from "./constants";

export interface Plugin {
  name: string;
  observer: (emit: (data: any) => void) => void;
  watcher: (this: Core, collectedData: CollectedType) => any;
}

export interface CollectedType {
  type: EventTypes;
  data: ErrorEvent | MouseEvent | any;
  [key: string]: any;
}
