import { Plugin } from "./plugin";
export interface CoreOptions {
  reportOptions: {
    url: string; // 上报接口配置信息
    method: "xhr" | "fetch" | "beacon" | "gif"; // 上报方式，可选值：'xhr' | 'fetch' | 'beacon' | 'gif'
    headers?: { [key: string]: string }; // 请求头信息
    payloadType?: "json" | "form"; // 请求体格式，可选值：'json' | 'form'
    globalData?: {
      userInfo?: any;
      deviceInfo?: any;
      networkInfo?: any;
      performanceInfo?: any;
      errorInfo?: any;
      customInfo?: any;
      projectInfo?: any;
      [key: string]: any;
    }; // 附加数据
  };
  codeErrorOptions?: {
    /** 错误栈深度 */
    stkLimit?: number;
  };
  breadcrumbOptions?: {
    enable: boolean; // 是否启用面包屑
    maxBreadcrumbs?: number; // 面包屑最大层级
  };
  plugins?: Plugin[];
}
