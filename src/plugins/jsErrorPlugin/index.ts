import { EventTypes, ErrorTypes, CollectedType, Plugin } from "@/types";
import { parseStackFrames } from "./helpers";

interface ResourceTarget {
  src?: string;
  href?: string;
  localName?: string;
}

const jsErrorPlugin: Plugin = {
  name: "jsErrorPlugin",
  observer(emit: (data: CollectedType) => void) {
    window.addEventListener(
      "error",
      (e: ErrorEvent) => {
        console.log(e, "jsErrorPluginjsErrorPluginjsErrorPlugin");

        // preventDefault 会导致报错停止流转
        // e.preventDefault();
        emit({
          type: EventTypes.ERROR,
          data: e,
        });
      },
      true
    );
  },
  watcher(collectedData: CollectedType) {
    const { stkLimit = 5 } = this.options?.codeErrorOptions;
    const { type, data } = collectedData;
    const { localName, src, href } = (data?.target as ResourceTarget) || {};

    // 资源加载错误
    if (localName) {
      const resourceData = {
        source: localName,
        href: src || href,
      };
      // 上报用户行为栈
      this.breadcrumb.unshift({
        type: type,
        category: ErrorTypes.RESOURCE_ERROR,
        data: resourceData,
        msg: `Unable to load "${resourceData.href}"`,
        t: +new Date(),
      });
      return {
        type: type,
        category: ErrorTypes.RESOURCE_ERROR,
        message: `Unable to load "${resourceData.href}"`,
        resource: resourceData,
      };
    }

    // 脚本错误
    const { message: msg, error } = data;
    console.log(data, collectedData, "datadatadata");
    this.breadcrumb.unshift({
      type: type,
      message: error?.message || msg,
      stack: error?.stack,
    });

    const frames = parseStackFrames(error, stkLimit);
    const stk = frames.map(
      ({ lineno: lin, colno: col, filename: file, functionName: fn }) => ({
        lin,
        col,
        file,
        fn,
      })
    );

    return {
      type: EventTypes.ERROR,
      message: error?.message || msg,
      stack: stk,
    };
  },
};

export { jsErrorPlugin };
