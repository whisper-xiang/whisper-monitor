// src/global.d.ts

// 扩展 Window 接口，添加自定义属性 deviceInfo
declare global {
  interface Window {
    deviceInfo?: {
      browserVersion: string | undefined;
      browser: string | undefined;
      osVersion: string | undefined;
      os: string | undefined;
      ua: string;
      device: string;
      deviceType: string;
    };
    WhisperMonitor?: any;
  }
}

declare module "ua-parser-js";

export {}; // 这是为了将这个文件标记为一个模块
