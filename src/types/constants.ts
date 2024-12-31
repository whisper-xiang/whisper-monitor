export enum EventTypes {
  CUSTOMER = 0, // 自定义事件
  LIFECYCLE = 1, // 生命周期
  ERROR, // 错误
  PERFORMANCE, // 性能
  CLICK, // 点击
  CONSOLE, // 控制台
  RECORD, // 记录
  XHR, // XHR
  API, // API
  PROMISE, // Promise 错误
  HASH, // Hash
  HISTORY, // History
  WHITE_SCREEN, // 白屏
}

export enum ErrorTypes {
  RESOURCE_ERROR = 1, // 资源错误
  JS_ERROR, // JS 错误
  API_ERROR, // API 错误
  UNKNOWN_ERROR, // 未知错误
}
