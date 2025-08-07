# Whisper Monitor

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Whisper Monitor 是一个轻量级、可插拔的前端监控 SDK，提供全面的前端监控解决方案，包括错误监控、性能监控、用户行为追踪和页面录制等功能。

## 特性

- 🚀 **轻量级**: 核心包体积小，按需加载插件
- 🔌 **可插拔**: 插件化架构，支持自定义扩展
- 📊 **全面监控**: 覆盖错误、性能、行为等多个维度
- 🎥 **页面录制**: 支持用户行为回放
- 🔄 **多种集成**: 支持直接引入和框架插件形式
- 📝 **TypeScript**: 完整的类型定义支持

## 安装

使用 npm:
```bash
npm install whisper-monitor
```

使用 yarn:
```bash
yarn add whisper-monitor
```

使用 pnpm:
```bash
pnpm add whisper-monitor
```

## 快速开始

### 基础使用

```javascript
import { init } from 'whisper-monitor';
import { clickPlugin, jsErrorPlugin } from 'whisper-monitor/plugins';

const monitor = init({
  reportOptions: {
    url: 'your-report-url',
    method: 'xhr',
    payloadType: 'json'
  },
  plugins: [clickPlugin, jsErrorPlugin]
});
```

### Vue 集成

```javascript
import { createApp } from 'vue';
import WhisperMonitor from 'whisper-monitor';
import { clickPlugin } from 'whisper-monitor/plugins';

const app = createApp(App);

app.use(WhisperMonitor, {
  reportOptions: {
    url: 'your-report-url',
    method: 'xhr',
    payloadType: 'json',
    globalData: {
      // 全局上报数据
      projectInfo: {
        name: 'your-project-name'
      }
    }
  },
  plugins: [clickPlugin]
});
```

## 功能模块

### 1. 错误监控
- JavaScript 运行时错误
- Promise 异常
- 资源加载错误
- 接口请求错误
- 白屏检测

### 2. 性能监控
- 页面加载性能
- 资源加载性能
- Web Vitals 指标
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
  - TTFB (Time to First Byte)
- 长任务监控

### 3. 用户行为追踪
- 页面点击
- 路由变化
- 接口调用
- 用户行为回放
- 面包屑记录

### 4. 页面录制
- 操作录制
- Canvas 录制
- 数据压缩
- 回放支持

## 插件系统

### 内置插件
- `clickPlugin`: 点击事件监控
- `jsErrorPlugin`: JavaScript 错误监控
- `xhrPlugin`: XHR 请求监控
- `fetchPlugin`: Fetch 请求监控
- `promiseErrorPlugin`: Promise 错误监控
- `historyPlugin`: 路由监控
- `performancePlugin`: 性能监控
- `blackScreenPlugin`: 白屏监控

### 自定义插件

```typescript
const customPlugin = {
  name: 'customPlugin',
  observer: (emit) => {
    // 监听逻辑
    emit({
      type: EventTypes.CUSTOMER,
      data: yourData
    });
  },
  watcher: (collectedData) => {
    // 数据处理逻辑
    return processedData;
  }
};
```

## 配置选项

```typescript
interface CoreOptions {
  reportOptions: {
    url: string;                          // 上报接口地址
    method: 'xhr' | 'fetch' | 'beacon';   // 上报方式
    headers?: Record<string, string>;     // 请求头
    payloadType?: 'json' | 'form';        // 数据格式
    globalData?: any;                     // 全局数据
  };
  codeErrorOptions?: {
    stkLimit?: number;                    // 错误栈深度
  };
  breadcrumbOptions?: {
    enable: boolean;                      // 启用面包屑
    maxBreadcrumbs?: number;             // 最大记录数
  };
  plugins?: Plugin[];                     // 插件列表
}
```

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动示例项目
cd example/vue3
pnpm dev

# 构建
pnpm build
```

## 项目结构

```
whisper-monitor/
├── packages/                # 核心包
│   ├── core/               # 核心功能
│   ├── performance/        # 性能监控
│   ├── screenRecord/       # 页面录制
│   ├── types/             # 类型定义
│   └── utils/             # 工具函数
├── example/                # 示例项目
│   ├── vue3/              # Vue 3 示例
│   ├── koa-ejs/           # 后端服务示例
│   └── server/            # 简单服务器
└── src/                    # 源代码
    ├── core/              # 核心实现
    ├── plugins/           # 插件集合
    ├── types/             # 类型定义
    └── utils/             # 工具函数
```

## 贡献指南

欢迎提交 Issue 和 Pull Request。在提交 PR 之前，请确保：

1. 添加/更新测试用例
2. 更新相关文档
3. 遵循现有的代码风格
4. 添加必要的注释

## License

MIT License

