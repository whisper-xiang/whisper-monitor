/**
 * 验证插件是否有效
 * @param name - 插件名称
 * @param observer - 观察者函数
 * @param watcher - 监听者函数
 * @returns 如果插件名称、观察者和监听者都存在则返回true，否则返回false
 */
export function isValidPlugin(
  name: string | undefined,
  observer: Function | undefined,
  watcher: Function | undefined
): boolean {
  return !!(name && observer && watcher);
}

/**
 * 获取任意目标的类型
 * @param target - 需要获取类型的目标
 * @returns 返回目标的类型字符串（小写）
 */
export function typeofAny(target: any): string {
  return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
}
/**
 * 判断目标是否为指定的类型
 * @param target - 需要判断类型的目标
 * @param type - 期望的类型字符串
 * @returns 如果目标的类型与期望类型相同则返回true，否则返回false
 */
export function toStringAny(target: any, type: string): boolean {
  return Object.prototype.toString.call(target) === type;
}

/**
 * 验证选项的类型是否符合期望
 * @param target - 需要验证的目标
 * @param targetName - 目标名称
 * @param expectType - 期望的类型
 * @returns 如果目标不存在返回false，如果类型匹配返回true，如果类型不匹配则打印错误信息
 */
export function validateOption(
  target: any,
  targetName: string,
  expectType: string
): any {
  if (!target) return false;
  if (typeofAny(target) === expectType) return true;
  console.error(
    `whisper-monitor: ${targetName}期望传入${expectType}类型，目前是${typeofAny(
      target
    )}类型`
  );
}
