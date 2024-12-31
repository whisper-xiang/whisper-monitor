// click
import { EventTypes, CollectedType } from "@/types";
import { _global } from "@/utils";
import { Plugin } from "@/types/plugin";
import { Core } from "@/index";

const clickPlugin: Plugin = {
  name: "clickPlugin",
  observer(emit: (data: CollectedType) => void) {
    _global.addEventListener("click", (event) => {
      emit({
        type: EventTypes.CLICK,
        data: event,
      });
    });
  },
  watcher(this: Core, collectedData: CollectedType) {
    const { type, data } = collectedData;
    this.breadcrumb.unshift({
      type: type,
      t: new Date(),
      data: data,
    });
  },
};
export { clickPlugin };
