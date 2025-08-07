import { overrideOriginal } from "@/utils";
import { EventTypes, ErrorTypes } from "@/types";

const XHRPlugin = {
  name: "XHRPlugin",
  observer(emit: (data) => void) {
    if (!window.XMLHttpRequest) return;
    const originalXhrProto = XMLHttpRequest.prototype;

    const tracker = this.tracker;

    const { isSdkTransportUrl } = this.tracker;
    overrideOriginal(originalXhrProto, "open", function (originalOpen) {
      return function (this: any, ...args: any[]) {
        this._xhr = {
          method: args[0],
          url: args[1],
          async: args[2],
        };
        return originalOpen.apply(this, args);
      };
    });

    overrideOriginal(originalXhrProto, "send", function (originalSend) {
      return function (this: any, ...args: any[]) {
        const _xhr = this._xhr;

        this.addEventListener("loadend", function (event) {
          if (!isSdkTransportUrl.call(tracker, this._xhr.url)) {
            emit({
              type: EventTypes.XHR,
              data: _xhr,
            });
          }
        });

        return originalSend.apply(this, args);
      };
    });
  },
  watcher(collectedData) {
    this.breadcrumb.unshift({
      bt: EventTypes.XHR,
      t: +new Date(),
    });

    return {
      t: +new Date(),
      e: EventTypes.API,
      dat: {
        ...collectedData,
      },
    };
  },
};

export { XHRPlugin };
