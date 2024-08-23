import { validateOption } from "@whisper/utils";
import { Plugin, CoreOptions } from "@whisper/types";
import {
  clickPlugin,
  XHRPlugin,
  jsErrorPlugin,
  promiseErrorPlugin,
  hashPlugin,
  historyPlugin,
} from "../plugins";

export class Options {
  reportOptions: CoreOptions["reportOptions"] = {
    url: "http://localhost:8090/reportData", // 上报接口地址
    method: "xhr", // 上报接口请求方法
    headers: {}, // 上报接口请求头
    payloadType: "json", // 上报接口请求体格式
  };
  codeErrorOptions?: CoreOptions["codeErrorOptions"] = {
    stkLimit: 3,
  };
  breadcrumbOptions?: CoreOptions["breadcrumbOptions"] = {
    maxBreadcrumbs: 100, // 面包屑最大层级
  };
  plugins: Plugin[] = [
    clickPlugin,
    XHRPlugin,
    jsErrorPlugin,
    promiseErrorPlugin,
    hashPlugin,
    historyPlugin,
  ];

  constructor(options: CoreOptions) {
    const { reportOptions, plugins } = options;

    reportOptions && (this.reportOptions = reportOptions);

    if (validateOption(plugins, "plugins", "array")) {
      plugins?.length && this.plugins.push(...plugins);
    }
  }
}
