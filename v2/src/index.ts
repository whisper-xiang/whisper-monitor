import { Breadcrumb, eventBus, Tracker, Options } from "./core";
import { Plugin, CoreOptions, EventTypes } from "@/types";
import { isValidPlugin } from "@/utils";
import { clickPlugin } from "./plugins";

export class Core {
  public readonly breadcrumb: Breadcrumb;
  public readonly tracker: Tracker;
  public readonly options: CoreOptions;

  constructor(options: CoreOptions) {
    this.options = new Options(options);
    this.breadcrumb = new Breadcrumb(this.options);
    this.tracker = new Tracker(this.options, this.breadcrumb);
  }

  public use(plugins: Plugin[]) {
    for (const plugin of plugins) {
      const { name: pluginName, observer, watcher } = plugin || {};

      // validate plugin
      if (!isValidPlugin(pluginName, observer, watcher)) {
        console.error(
          `The plugin name [${pluginName}] is invalid, please check it.`
        );
        continue;
      }

      try {
        observer.call(this, eventBus.emit.bind(eventBus, pluginName));
      } catch (error: any) {
        console.error(
          `The plugin [${pluginName}] encountered an error: ${error.message}`
        );
        continue;
      }

      const callback = (...args: any) => {
        const pluginData = watcher.apply(this, args);

        if (!pluginData) {
          return;
        }
        this.tracker.report(pluginData).then(() => {
          console.log("上报成功", this.breadcrumb);
        });
      };

      eventBus.on(pluginName, callback);
    }
  }
}
// export init method, as entry point
const init = (options: CoreOptions) => {
  const client = new Core(options);
  const { plugins = [] } = client.options;

  client.use(plugins);
  return client;
};

// if install by install method, then as Vue plugin
const install = (VueOrApp: any, options: CoreOptions) => {
  // 1. init core, register all plugins
  const core = init(options);

  const originalErrorHandler = VueOrApp.config.errorHandler;

  VueOrApp.config.errorHandler = (err: Error, vm: any, info: string) => {
    eventBus.emit("jsErrorPlugin", { type: EventTypes.ERROR, data: err });

    if (originalErrorHandler) {
      originalErrorHandler.call(this, err, vm, info);
    }
  };

  // 2. bind tracker to Vue instance
  const isVue3 = VueOrApp.version && VueOrApp.version.startsWith("3");

  if (isVue3) {
    // Vue 3 逻辑
    VueOrApp.config.globalProperties.$tracker = core.tracker;
  } else {
    // Vue 2 逻辑
    VueOrApp.prototype.$tracker = core.tracker;
  }
};

export const plugins = {
  clickPlugin,
};

// 只使用具名导出
const whisperMonitor = {
  install,
  init,
  plugins,
};

// 使用 module.exports 导出
export default whisperMonitor;
