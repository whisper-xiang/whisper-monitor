import {
  EventTypes,
  ErrorTypes,
  CollectedType,
  Plugin,
  EventTypesMap,
} from "@/types";
import ErrorStackParser from "error-stack-parser";
import { _global } from "@/utils";

const jsErrorPlugin: Plugin = {
  name: "jsErrorPlugin",
  observer(emit: (data: CollectedType) => void) {
    _global.addEventListener(
      "error",
      (e: ErrorEvent) => {
        // preventDefault 会导致报错停止流转
        // e.preventDefault();
        emit({
          type: EventTypesMap[EventTypes.ERROR],
          data: e,
        });
      },
      true
    );
  },
  watcher(collectedData: CollectedType) {
    const stkLimit = this.options?.codeErrorOptions?.stkLimit || 5;
    const { type, data: ev } = collectedData;
    const target = ev.target;

    // 脚本错误
    if (!target || (ev.target && !ev.target.localName)) {
      // vue和react捕获的报错使用ev解析，异步错误使用ev.error解析
      const stackFrames = ErrorStackParser.parse(!target ? ev : ev.error);
      const stackFrame = stackFrames.slice(0, stkLimit);
      const { fileName, columnNumber, lineNumber } = stackFrame[0] || {};

      const reportData = {
        type,
        category: ErrorTypes.JS_ERROR,
        data: {
          message: ev.message,
          fileName,
          line: lineNumber,
          column: columnNumber,
          stack: stackFrame,
        },
        t: +new Date(),
      };

      // 先返回数据，让上报流程完成后再添加到面包屑
      return reportData;
    }

    // 资源加载报错
    if (target?.localName) {
      const resourceData = {
        source: target.localName,
        href: target.src || target.href,
      };

      const reportData = {
        type: type,
        category: ErrorTypes.RESOURCE_ERROR,
        data: {
          message: `Unable to load "${resourceData.href}"`,
          resource: resourceData,
        },
        t: +new Date(),
      };
      // 先返回数据，让上报流程完成后再添加到面包屑
      return reportData;
    }
  },
};

export { jsErrorPlugin };
