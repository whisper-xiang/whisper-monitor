import { UAParser } from "ua-parser-js";

interface DeviceInfo {
  browserVersion: string | undefined;
  browser: string | undefined;
  osVersion: string | undefined;
  os: string | undefined;
  ua: string;
  device: string;
  deviceType: string;
}

// 获取全局变量
export function getGlobal(): Window {
  return window;
}

// 获取设备信息
export function getDeviceInfo(): DeviceInfo {
  const uaResult = new UAParser().getResult();

  return {
    browserVersion: uaResult.browser.version,
    browser: uaResult.browser.name,
    osVersion: uaResult.os.version,
    os: uaResult.os.name,
    ua: uaResult.ua,
    device: uaResult.device.model || "Unknown",
    deviceType: uaResult.device.type || "Pc",
  };
}

// 将设备信息挂载到全局对象的命名空间下
const _global = getGlobal();
_global.deviceInfo = getDeviceInfo();

// 示例调用，初始化设备信息并挂载到全局对象上

export { _global };
