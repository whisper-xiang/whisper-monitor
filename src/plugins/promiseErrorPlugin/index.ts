// unhandledrejection

import {
  CollectedType,
  ErrorTypes,
  ErrorTypesMap,
  EventTypes,
  EventTypesMap,
} from "@/types";
import { _global } from "@/utils";

const promiseErrorPlugin = {
  name: "promiseErrorPlugin",
  observer(emit: (data: CollectedType) => void) {
    _global.addEventListener(
      "unhandledrejection",
      (e: PromiseRejectionEvent) => {
        // e.preventDefault();
        emit({
          type: EventTypesMap[EventTypes.ERROR],
          category: ErrorTypesMap[ErrorTypes.UNHANDLED_REJECTION],
          data: e,
        });
      }
    );
  },
  watcher(collectedData: CollectedType) {
    const { type, data } = collectedData;
    console.log(collectedData);

    const reportData = {
      type,
      category: ErrorTypesMap[ErrorTypes.UNHANDLED_REJECTION],
      // data: {
      //   message: ev.message,
      //   fileName,
      //   line: lineNumber,
      //   column: columnNumber,
      //   stack: stackFrame,
      // },
      // t: +new Date(),
    };

    // 先返回数据，让上报流程完成后再添加到面包屑
    return reportData;
  },
};

export { promiseErrorPlugin };
