/**
 * Whisper Monitor 数据上报格式 TypeScript 类型定义
 * @version 2.0.0
 */

// 基础类型定义
export type EventLevel = "debug" | "info" | "warning" | "error" | "fatal";
export type Environment = "development" | "staging" | "production";
export type Platform =
  | "Windows"
  | "macOS"
  | "Linux"
  | "iOS"
  | "Android"
  | "iPadOS";
export type Browser =
  | "Chrome"
  | "Firefox"
  | "Safari"
  | "Edge"
  | "Opera"
  | "IE"
  | "Other";
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

// 设备信息
export interface DeviceInfo {
  platform?: Platform;
  browser?: Browser;
  browserVersion?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
  timezone?: string;
}

// 面包屑类型
export type BreadcrumbType =
  | "click"
  | "navigation"
  | "request"
  | "console"
  | "error"
  | "custom";

export interface Breadcrumb {
  type: BreadcrumbType;
  message: string;
  timestamp: number;
  data?: Record<string, any>;
}

// 错误堆栈帧
export interface StackFrame {
  functionName: string;
  filename: string;
  lineno: number;
  colno: number;
}

// 资源信息
export interface ResourceInfo {
  tagName: string;
  url: string;
  outerHTML?: string;
}

// 通用字段接口
export interface CommonFields {
  timestamp: number;
  url: string;
  userAgent: string;
  deviceInfo?: DeviceInfo;
  userId?: string;
  sessionId?: string;
  projectId: string;
  version: string;
  environment: Environment;
  level?: EventLevel;
  sdkVersion?: string;
  traceId?: string;
  spanId?: string;
  fingerprint?: string;
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, any>;
}

// 错误上报格式
export type ErrorCategory =
  | "JS_ERROR"
  | "RESOURCE_ERROR"
  | "PROMISE_ERROR"
  | "NETWORK_ERROR"
  | "CUSTOM_ERROR";

export interface ErrorReport extends CommonFields {
  type: "ERROR";
  category: ErrorCategory;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: StackFrame[];
  resource?: ResourceInfo;
  breadcrumbs?: Breadcrumb[];
}

// 性能上报格式
export type PerformanceCategory =
  | "NAVIGATION"
  | "RESOURCE"
  | "VITALS"
  | "LONG_TASK";

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  loadComplete?: number;
}

export interface ResourceMetric {
  name: string;
  type: string;
  duration: number;
  size?: number;
}

export interface PerformanceReport extends CommonFields {
  type: "PERFORMANCE";
  category: PerformanceCategory;
  metrics?: PerformanceMetrics;
  resources?: ResourceMetric[];
}

// 用户行为上报格式
export type BehaviorCategory =
  | "CLICK"
  | "NAVIGATION"
  | "SCROLL"
  | "INPUT"
  | "CUSTOM";

export interface ElementTarget {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  xpath?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface BehaviorReport extends CommonFields {
  type: "BEHAVIOR";
  category: BehaviorCategory;
  action: string;
  target?: ElementTarget;
  position?: Position;
  referrer?: string;
}

// API请求上报格式
export type ApiCategory = "XHR" | "FETCH" | "WEBSOCKET";

export interface ApiReport extends CommonFields {
  type: "API";
  category: ApiCategory;
  method: HttpMethod;
  url: string;
  status: number;
  statusText?: string;
  duration: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  pageUrl?: string;
}

// 自定义事件上报格式
export interface CustomReport extends CommonFields {
  type: "CUSTOM";
  name: string;
  category?: string;
  value?: number;
  data?: Record<string, any>;
}

// 联合类型 - 所有上报格式
export type ReportData =
  | ErrorReport
  | PerformanceReport
  | BehaviorReport
  | ApiReport
  | CustomReport;

// 批量上报格式
export interface BatchMetadata {
  userId?: string;
  sessionId?: string;
  projectId: string;
  version: string;
  environment: Environment;
  sdkVersion?: string;
}

export interface BatchReport {
  batch: true;
  batchId: string;
  timestamp: number;
  items: ReportData[];
  metadata: BatchMetadata;
}

// 上报响应格式
export interface ReportResponse {
  success: boolean;
  message?: string;
  errorId?: string;
  code?: number;
}

// 配置接口
export interface ReportOptions {
  url: string;
  method?: "xhr" | "fetch" | "beacon" | "gif";
  headers?: Record<string, string>;
  payloadType?: "json" | "form";
  timeout?: number;
  retries?: number;
  batchSize?: number;
  batchTimeout?: number;
  enableCompression?: boolean;
  globalData?: Record<string, any>;
}

export interface MonitorConfig {
  reportOptions: ReportOptions;
  maxBreadcrumbs?: number;
  maxStackFrames?: number;
  enableBreadcrumb?: boolean;
  enableAutoReport?: boolean;
  sampleRate?: number;
  beforeSend?: (data: ReportData) => ReportData | null;
  onReportSuccess?: (data: ReportData, response: ReportResponse) => void;
  onReportError?: (data: ReportData, error: Error) => void;
}

// 插件接口
export interface PluginContext {
  config: MonitorConfig;
  report: (data: ReportData) => Promise<ReportResponse>;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
  getBreadcrumbs: () => Breadcrumb[];
}

export interface Plugin {
  name: string;
  version?: string;
  install: (context: PluginContext) => void;
  uninstall?: () => void;
}

// 监控器主类接口
export interface Monitor {
  config: MonitorConfig;
  report: (data: ReportData) => Promise<ReportResponse>;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
  getBreadcrumbs: () => Breadcrumb[];
  use: (plugin: Plugin) => void;
  unuse: (pluginName: string) => void;
  destroy: () => void;
}

// 工具函数类型
export type DataValidator = (data: ReportData) => boolean;
export type DataTransformer = (data: ReportData) => ReportData;
export type DataFilter = (data: ReportData) => boolean;

// 统计接口
export interface ErrorStats {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<EventLevel, number>;
  byHour: Record<number, number>;
  recent: ErrorReport[];
}

export interface PerformanceStats {
  averageMetrics: PerformanceMetrics;
  p95Metrics: PerformanceMetrics;
  slowestResources: ResourceMetric[];
  totalSamples: number;
}

export interface BehaviorStats {
  totalActions: number;
  byCategory: Record<BehaviorCategory, number>;
  popularActions: Array<{
    action: string;
    count: number;
  }>;
  userFlow: Array<{
    url: string;
    visits: number;
  }>;
}

// 导出所有类型
export {
  // 基础类型
  EventLevel,
  Environment,
  Platform,
  Browser,
  HttpMethod,
  BreadcrumbType,

  // 分类类型
  ErrorCategory,
  PerformanceCategory,
  BehaviorCategory,
  ApiCategory,

  // 数据结构
  DeviceInfo,
  Breadcrumb,
  StackFrame,
  ResourceInfo,
  CommonFields,

  // 上报格式
  ErrorReport,
  PerformanceReport,
  BehaviorReport,
  ApiReport,
  CustomReport,
  ReportData,
  BatchReport,

  // 配置和响应
  ReportOptions,
  MonitorConfig,
  ReportResponse,

  // 插件系统
  Plugin,
  PluginContext,
  Monitor,

  // 工具类型
  DataValidator,
  DataTransformer,
  DataFilter,

  // 统计类型
  ErrorStats,
  PerformanceStats,
  BehaviorStats,
};

// 默认导出主要接口
export default ReportData;
