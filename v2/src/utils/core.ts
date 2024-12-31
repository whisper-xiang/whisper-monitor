export function isValidPlugin(
  name: string | undefined,
  observer: Function | undefined,
  watcher: Function | undefined
): boolean {
  return !!(name && observer && watcher);
}

export function typeofAny(target: any): string {
  return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
}
export function toStringAny(target: any, type: string): boolean {
  return Object.prototype.toString.call(target) === type;
}

// 验证选项的类型
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
