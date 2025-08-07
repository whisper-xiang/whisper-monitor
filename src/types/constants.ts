export enum EventTypes {
  CUSTOMER = 0, // 自定义事件
  LIFECYCLE = 1, // 生命周期
  ERROR = 2, // 错误
  PERFORMANCE = 3, // 性能
  CLICK = 4, // 点击
  RECORD = 5, // 记录
  XHR = 6, // XHR
  API = 7, // API
  PROMISE = 8, // Promise 错误
  HASH = 9, // Hash
  HISTORY = 10, // History
  WHITE_SCREEN = 11, // 白屏
}

export enum LifecycleTypes {
  PAGE_VIEW = 0, // 页面浏览
  PAGE_HIDE, // 页面隐藏
  PAGE_UNLOAD, // 页面卸载
  PAGE_ERROR, // 页面错误
  PAGE_RESOURCE_ERROR, // 页面资源错误
  PAGE_JS_ERROR, // 页面 JS 错误
  PAGE_API_ERROR, // 页面 API 错误
  PAGE_UNKNOWN_ERROR, // 页面未知错误
}

export enum ErrorTypes {
  RESOURCE_ERROR = 1, // 资源错误
  JS_ERROR, // JS 错误
  API_ERROR, // API 错误
  UNKNOWN_ERROR, // 未知错误
}
