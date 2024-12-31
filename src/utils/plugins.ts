/**
 * 重写原有方法
 * ../export
 * ../param {{ [key: string]: any }} source
 * ../param {keyof T} name
 * ../param {(originalMethod: Method) => Method} replacement
 * ../param {boolean} isForced
 * ../returns
 */
export const overrideOriginal = (
  source: any,
  name: string,
  replacement: (...args: any[]) => any,
  isForced?: boolean
) => {
  if (source === undefined) return;
  if (name in source || isForced) {
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === "function") {
      source[name] = wrapped;
    }
  }
};
