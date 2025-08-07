// unhandledrejection

import { CollectedType, EventTypes } from "@/types";
import { _global } from "@/utils";

const promiseErrorPlugin = {
  name: "promiseErrorPlugin",
  observer(emit: (data: CollectedType) => void) {
    _global.addEventListener(
      "unhandledrejection",
      (e: PromiseRejectionEvent) => {
        e.preventDefault();
        emit({
          type: EventTypes.ERROR,
          category: "unhandledrejection",
          data: e,
        });
      }
    );
  },
  watcher(collectedData: CollectedType) {
    return {
      ...collectedData,
    };
  },
};

export { promiseErrorPlugin };
