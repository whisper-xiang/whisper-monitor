// click

import { EventTypes, ErrorTypes, CollectedType } from "@whisper/types";
import { _global } from "@whisper/utils";

const clickPlugin = {
  name: "clickPlugin",
  observer(emit: (data: CollectedType) => void) {
    _global.addEventListener("click", (event) => {
      console.log("click");

      emit({
        type: EventTypes.CLICK,
        data: event,
      });
    });
  },
  watcher(collectedData: CollectedType) {
    const { type, data } = collectedData;
    this.breadcrumb.unshift({
      type: type,
    });
    // return {
    //   type: EventTypes.CLICK,
    //   data: data,
    // };
  },
};

export { clickPlugin };
