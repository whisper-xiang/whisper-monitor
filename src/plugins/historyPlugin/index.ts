// hashchange

import { CollectedType, EventTypes } from "@/types";
import { _global, overrideOriginal } from "@/utils";

const historyPlugin = {
  name: "historyPlugin",
  observer(emit: (data: CollectedType) => void) {
    if (!_global.history) return;
    const originalHistoryProto = window.history.constructor.prototype;
    overrideOriginal(originalHistoryProto, "pushState", (originalPushState) => {
      return function (this: any, ...args: any[]) {
        const to = document.location.href;
        emit({
          type: EventTypes.HISTORY,
          category: "history",
          data: {
            to,
          },
        });
        return originalPushState.apply(this, args);
      };
    });
  },
  watcher(collectedData: CollectedType) {
    return {
      ...collectedData,
    };
  },
};

export { historyPlugin };
