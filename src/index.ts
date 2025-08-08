import { Breadcrumb, eventBus, Tracker, Options } from "./core";
import { Plugin, CoreOptions, EventTypes } from "@/types";
import { isValidPlugin } from "@/utils";
import { clickPlugin, jsErrorPlugin, promiseErrorPlugin } from "./plugins";

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

      const callback = async (...args: any) => {
        const pluginData = watcher.apply(this, args);

        if (!pluginData) {
          return;
        }

        // 先上报数据
        await this.tracker.report(pluginData);

        console.log("上报成功", this.breadcrumb);
      };

      eventBus.on(pluginName, callback);
    }
  }
}

// 导出初始化方法
export const init = (options: CoreOptions) => {
  const client = new Core(options);
  const { plugins = [] } = client.options;

  client.use(plugins);
  return client;
};

// Vue 插件形式接入
export const install = (VueOrApp: any, options: CoreOptions) => {
  const core = init(options);

  const originalErrorHandler = VueOrApp.config.errorHandler;

  VueOrApp.config.errorHandler = (err: Error, vm: any, info: string) => {
    eventBus.emit("jsErrorPlugin", {
      type: EventTypes.ERROR,
      data: err,
    });

    if (originalErrorHandler) {
      originalErrorHandler.call(this, err, vm, info);
    }
  };

  // Vue 3 与 Vue 2 的不同处理
  const isVue3 = VueOrApp.version && VueOrApp.version.startsWith("3");

  // 将 tracker 挂载到 Vue 实例上
  if (isVue3) {
    VueOrApp.config.globalProperties.$tracker = core.tracker;
  } else {
    VueOrApp.prototype.$tracker = core.tracker;
  }
};

export const plugins = {
  clickPlugin,
  jsErrorPlugin,
  promiseErrorPlugin,
};

window.WhisperMonitor = {
  install,
  init,
  plugins,
};
