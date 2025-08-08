// click
import { EventTypes, EventTypesMap, CollectedType, LogLevel } from "@/types";
import { _global } from "@/utils";
import { Plugin } from "@/types/plugin";
import { Core } from "@/index";
import { getDomSelector } from "./helper";

const clickPlugin: Plugin = {
  name: "clickPlugin",
  observer(emit: (data: CollectedType) => void) {
    _global.addEventListener("click", (event) => {
      emit({
        type: EventTypesMap[EventTypes.CLICK],
        data: event,
      });
    });
  },
  watcher(this: Core, collectedData: CollectedType) {
    const { type, data } = collectedData;
    console.log(data, "datadata");
    this.breadcrumb.unshift({
      type: type,
      t: +new Date(),
      data: {
        selector: getDomSelector(data.target),
        page:
          window.location.pathname +
          window.location.search +
          window.location.hash,
      },
      level: LogLevel.INFO,
    });
  },
};
export { clickPlugin };
