import { CoreOptions, ReportData, EventTypes } from "@/types";
import { Breadcrumb } from "./breadcrumb";
import { _global } from "@/utils/global";

export class Tracker {
  private options: CoreOptions; // 合并后的全局配置
  private breadcrumb: Breadcrumb;

  constructor(options: CoreOptions, breadcrumb: Breadcrumb) {
    this.options = options;
    this.breadcrumb = breadcrumb;
  }

  // 上报数据
  public report(
    data: ReportData<any>,
    customOptions?: Partial<CoreOptions["reportOptions"]>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // 合并自定义上报配置与全局配置
      const reportOptions = {
        ...this.options.reportOptions,
        ...customOptions,
      };

      // 附加数据（如用户行为、时间戳等）
      const reportData = this.attach(data);

      // 封装上报逻辑，使用 requestIdleCallback 延迟上报
      const reportTask = () => {
        switch (reportOptions.method) {
          case "fetch":
            this.reportWithFetch(reportData, reportOptions).then(
              resolve,
              reject
            );
            break;
          case "beacon":
            this.reportWithBeacon(reportData, reportOptions).then(
              resolve,
              reject
            );
            break;
          case "xhr":
          default:
            this.reportWithXHR(reportData, reportOptions).then(resolve, reject);
            break;
        }
      };

      if (typeof requestIdleCallback === "function") {
        // 如果浏览器支持 requestIdleCallback，使用它来延迟执行上报任务
        requestIdleCallback(reportTask);
      } else {
        // 如果浏览器不支持 requestIdleCallback，直接执行上报任务
        reportTask();
      }
    });
  }

  // 使用 XHR 方式上报
  private reportWithXHR(
    data: ReportData<any>,
    options: CoreOptions["reportOptions"]
  ) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", options.url, true);

      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.setRequestHeader(
        "Content-Type",
        options.payloadType === "json"
          ? "application/json"
          : "application/x-www-form-urlencoded"
      );

      xhr.send(
        options.payloadType === "json"
          ? JSON.stringify(data)
          : this.toFormData(data)
      );

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      };

      xhr.onerror = () => {
        reject(xhr.statusText);
      };
    });
  }

  // 使用 Fetch API 方式上报
  private async reportWithFetch(
    data: ReportData<any>,
    options: CoreOptions["reportOptions"]
  ) {
    try {
      return await fetch(options.url, {
        method: "POST",
        headers: {
          ...options.headers,
          "Content-Type":
            options.payloadType === "json"
              ? "application/json"
              : "application/x-www-form-urlencoded",
        },
        body:
          options.payloadType === "json"
            ? JSON.stringify(data)
            : this.toFormData(data),
      });
    } catch (error) {
      console.error("Fetch report failed:", error);
    }
  }

  // 使用 Beacon API 方式上报
  private reportWithBeacon(
    data: ReportData<any>,
    options: CoreOptions["reportOptions"]
  ) {
    return new Promise((resolve) => {
      const payload =
        options.payloadType === "json"
          ? JSON.stringify(data)
          : this.toFormData(data);
      const result = navigator.sendBeacon(options.url, payload);
      resolve(result);
    });
  }

  // 将数据转换为 URL 编码的表单数据格式
  private toFormData(data: ReportData<any>): string {
    return Object.entries(data)
      .map(
        ([key, value]) =>
          encodeURIComponent(key) + "=" + encodeURIComponent(String(value))
      )
      .join("&");
  }

  // 附加数据
  private attach(data: ReportData<any>) {
    // 判断是否启用了行为记录功能
    if (!this.options?.breadcrumbOptions?.enable) {
      const excludeBreadcrumb = [
        EventTypes.PERFORMANCE,
        EventTypes.RECORD,
        EventTypes.WHITE_SCREEN,
      ];
      if (!excludeBreadcrumb.includes(data.type)) {
        data.breadcrumb = this.breadcrumb.getStack(); // 获取用户行为栈
      }
    }

    // 附加全局数据，比如设备信息、用户信息等
    Object.assign(data, this.options?.reportOptions?.globalData || {});
    // 附加时间戳
    data.timestamp = Date.now();
    data.deviceInfo = _global.deviceInfo;

    // TODO: 其他附加数据逻辑
    return data;
  }

  // 判断是否为 SDK 传输地址
  public isSdkTransportUrl(targetUrl: string): boolean {
    return targetUrl.includes(this.options?.reportOptions?.url || "");
  }
}
