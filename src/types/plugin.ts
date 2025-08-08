import { Core } from "..";

export interface Plugin {
  name: string;
  observer: (emit: (data: any) => void) => void;
  watcher: (this: Core, collectedData: CollectedType) => any;
}

export interface CollectedType {
  type: string;
  data: ErrorEvent | MouseEvent | any;
  [key: string]: any;
}
