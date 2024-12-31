export type UnknownFunc = (...args: unknown[]) => void;

/**
 * 发布订阅类
 *
 * @export
 * @class EventBus
 * @template T 事件枚举
 */
class EventBus {
  deps: Map<string, UnknownFunc[]> = new Map();
  on(eventName: string, callBack: (data: any) => any) {
    const fns = this.deps.get(eventName);
    if (fns) {
      this.deps.set(eventName, fns.concat(callBack));
      return;
    }
    this.deps.set(eventName, [callBack]);
  }
  emit<D = any>(eventName: string, data: D) {
    const fns = this.deps.get(eventName);
    if (!eventName || !fns) return;
    fns.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

export const eventBus = new EventBus();
