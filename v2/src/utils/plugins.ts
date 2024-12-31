/**
 * 重写原有方法
 * ../export
 * ../param {{ [key: string]: any }} source
 * ../param {keyof T} name
 * ../param {(originalMethod: Method) => Method} replacement
 * ../param {boolean} isForced
 * ../returns
 */

// type Method = (...args: any[]) => any;

// export function overrideOriginal<T extends object>(
//   source: T,
//   name: keyof T,
//   replacement: (originalMethod: Method) => Method,
//   isForced: boolean = false
// ): void {
//   if (isForced || name in source) {
//     const originalMethod = source[name] as Method;

//     if (typeof originalMethod === "function") {
//       source[name] = replacement(originalMethod) as any;
//     } else if (isForced) {
//       // If isForced is true and the original method doesn't exist, add it with the replacement.
//       source[name] = replacement(() => {}) as any;
//     }
//   } else if (isForced) {
//     // If isForced is true and the method does not exist, add it with the replacement.
//     source[name] = replacement(() => {}) as any;
//   }
// }

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
