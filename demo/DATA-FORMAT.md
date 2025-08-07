# Whisper Monitor 数据上报格式规范

## 概述

本文档定义了 Whisper Monitor 前端监控 SDK 的数据上报格式规范，包括错误监控、性能监控、用户行为追踪、API监控和自定义事件等各种数据类型的标准格式。

## 版本信息

- **当前版本**: 2.0.0
- **兼容版本**: 1.x
- **更新日期**: 2024-01-01

## 设计原则

1. **统一性**: 所有数据格式遵循统一的结构和命名规范
2. **可扩展性**: 支持自定义字段和插件扩展
3. **向后兼容**: 新版本保持对旧版本的兼容性
4. **性能优化**: 数据结构紧凑，减少传输开销
5. **类型安全**: 提供完整的 TypeScript 类型定义

## 通用字段

所有上报数据都包含以下通用字段：

### 必需字段

| 字段名 | 类型 | 描述 | 示例 |
|--------|------|------|------|
| `timestamp` | number | 时间戳（毫秒） | `1640995200000` |
| `url` | string | 当前页面URL | `"https://example.com/dashboard"` |
| `userAgent` | string | 用户代理字符串 | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"` |
| `projectId` | string | 项目ID | `"project_demo"` |
| `version` | string | 项目版本号 | `"1.2.3"` |
| `environment` | string | 环境标识 | `"production"` |

### 可选字段

| 字段名 | 类型 | 描述 | 示例 |
|--------|------|------|------|
| `deviceInfo` | object | 设备信息 | 见设备信息结构 |
| `userId` | string | 用户ID | `"user_12345"` |
| `sessionId` | string | 会话ID | `"session_abcdef"` |
| `level` | string | 事件级别 | `"error"` |
| `sdkVersion` | string | SDK版本号 | `"2.0.0"` |
| `traceId` | string | 链路追踪ID | `"trace_xyz789"` |
| `spanId` | string | Span ID | `"span_abc123"` |
| `fingerprint` | string | 事件指纹 | `"js_error_null_property"` |
| `tags` | object | 自定义标签 | `{"module": "dashboard"}` |
| `extra` | object | 额外数据 | `{"customField": "value"}` |

### 设备信息结构

```json
{
  "platform": "Windows",
  "browser": "Chrome",
  "browserVersion": "96.0.4664.110",
  "screenWidth": 1920,
  "screenHeight": 1080,
  "viewportWidth": 1200,
  "viewportHeight": 800,
  "language": "zh-CN",
  "timezone": "Asia/Shanghai"
}
```

## 数据格式详细说明

### 1. 错误上报格式 (ERROR)

用于上报JavaScript错误、资源加载错误、Promise异常等。

#### 字段说明

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `type` | string | ✅ | 固定值 `"ERROR"` |
| `category` | string | ✅ | 错误分类 |
| `message` | string | ✅ | 错误消息 |
| `filename` | string | ❌ | 出错文件路径 |
| `lineno` | number | ❌ | 错误行号 |
| `colno` | number | ❌ | 错误列号 |
| `stack` | array | ❌ | 错误堆栈信息 |
| `resource` | object | ❌ | 资源错误信息 |
| `breadcrumbs` | array | ❌ | 面包屑记录 |

#### 错误分类 (category)

- `JS_ERROR`: JavaScript运行时错误
- `RESOURCE_ERROR`: 资源加载错误
- `PROMISE_ERROR`: Promise未捕获异常
- `NETWORK_ERROR`: 网络请求错误
- `CUSTOM_ERROR`: 自定义错误

#### 示例

```json
{
  "type": "ERROR",
  "category": "JS_ERROR",
  "message": "Cannot read property 'someMethod' of null",
  "filename": "https://example.com/js/app.js",
  "lineno": 123,
  "colno": 45,
  "stack": [
    {
      "functionName": "handleClick",
      "filename": "https://example.com/js/app.js",
      "lineno": 123,
      "colno": 45
    }
  ],
  "breadcrumbs": [
    {
      "type": "click",
      "message": "用户点击了按钮",
      "timestamp": 1640995180000,
      "data": {
        "element": "button#submit",
        "text": "提交"
      }
    }
  ],
  "timestamp": 1640995200000,
  "url": "https://example.com/dashboard",
  "userAgent": "Mozilla/5.0...",
  "projectId": "project_demo",
  "version": "1.2.3",
  "environment": "production"
}
```

### 2. 性能上报格式 (PERFORMANCE)

用于上报页面性能指标、资源加载性能等。

#### 字段说明

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `type` | string | ✅ | 固定值 `"PERFORMANCE"` |
| `category` | string | ✅ | 性能分类 |
| `metrics` | object | ❌ | 性能指标 |
| `resources` | array | ❌ | 资源加载信息 |

#### 性能分类 (category)

- `NAVIGATION`: 页面导航性能
- `RESOURCE`: 资源加载性能
- `VITALS`: Web Vitals 指标
- `LONG_TASK`: 长任务监控

#### 性能指标 (metrics)

| 指标名 | 描述 | 单位 |
|--------|------|------|
| `fcp` | 首次内容绘制 | 毫秒 |
| `lcp` | 最大内容绘制 | 毫秒 |
| `fid` | 首次输入延迟 | 毫秒 |
| `cls` | 累积布局偏移 | 分数 |
| `ttfb` | 首字节时间 | 毫秒 |
| `domContentLoaded` | DOM内容加载完成 | 毫秒 |
| `loadComplete` | 页面完全加载 | 毫秒 |

#### 示例

```json
{
  "type": "PERFORMANCE",
  "category": "NAVIGATION",
  "metrics": {
    "fcp": 1200.5,
    "lcp": 2100.8,
    "fid": 45.2,
    "cls": 0.15,
    "ttfb": 280.3,
    "domContentLoaded": 1800.2,
    "loadComplete": 3200.7
  },
  "timestamp": 1640995500000,
  "url": "https://example.com/dashboard",
  "userAgent": "Mozilla/5.0...",
  "projectId": "project_demo",
  "version": "1.2.3",
  "environment": "production"
}
```

### 3. 用户行为上报格式 (BEHAVIOR)

用于追踪用户交互行为、页面导航等。

#### 字段说明

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `type` | string | ✅ | 固定值 `"BEHAVIOR"` |
| `category` | string | ✅ | 行为分类 |
| `action` | string | ✅ | 具体行为动作 |
| `target` | object | ❌ | 目标元素信息 |
| `position` | object | ❌ | 位置信息 |
| `referrer` | string | ❌ | 来源页面URL |

#### 行为分类 (category)

- `CLICK`: 点击行为
- `NAVIGATION`: 页面导航
- `SCROLL`: 滚动行为
- `INPUT`: 输入行为
- `CUSTOM`: 自定义行为

#### 示例

```json
{
  "type": "BEHAVIOR",
  "category": "CLICK",
  "action": "button_click",
  "target": {
    "tagName": "button",
    "id": "submit-btn",
    "className": "btn btn-primary",
    "textContent": "提交订单",
    "xpath": "/html/body/div[1]/form/button"
  },
  "position": {
    "x": 150,
    "y": 300
  },
  "timestamp": 1640995700000,
  "url": "https://example.com/checkout",
  "referrer": "https://example.com/cart",
  "userAgent": "Mozilla/5.0...",
  "projectId": "project_demo",
  "version": "1.2.3",
  "environment": "production"
}
```

### 4. API请求上报格式 (API)

用于监控XHR、Fetch等API请求。

#### 字段说明

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `type` | string | ✅ | 固定值 `"API"` |
| `category` | string | ✅ | 请求分类 |
| `method` | string | ✅ | HTTP方法 |
| `url` | string | ✅ | 请求URL |
| `status` | number | ✅ | HTTP状态码 |
| `duration` | number | ✅ | 请求耗时（毫秒） |
| `statusText` | string | ❌ | 状态文本 |
| `requestHeaders` | object | ❌ | 请求头 |
| `responseHeaders` | object | ❌ | 响应头 |
| `requestBody` | string | ❌ | 请求体 |
| `responseBody` | string | ❌ | 响应体 |
| `pageUrl` | string | ❌ | 当前页面URL |

#### 请求分类 (category)

- `XHR`: XMLHttpRequest
- `FETCH`: Fetch API
- `WEBSOCKET`: WebSocket连接

#### 示例

```json
{
  "type": "API",
  "category": "XHR",
  "method": "POST",
  "url": "https://api.example.com/v1/users",
  "status": 201,
  "statusText": "Created",
  "duration": 450.3,
  "requestHeaders": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  },
  "responseHeaders": {
    "Content-Type": "application/json",
    "X-RateLimit-Remaining": "99"
  },
  "requestBody": "{\"name\":\"John Doe\",\"email\":\"john@example.com\"}",
  "responseBody": "{\"id\":12345,\"name\":\"John Doe\"}",
  "timestamp": 1640995900000,
  "pageUrl": "https://example.com/admin/users",
  "userAgent": "Mozilla/5.0...",
  "projectId": "project_demo",
  "version": "1.2.3",
  "environment": "production"
}
```

### 5. 自定义事件上报格式 (CUSTOM)

用于上报业务自定义事件。

#### 字段说明

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `type` | string | ✅ | 固定值 `"CUSTOM"` |
| `name` | string | ✅ | 事件名称 |
| `category` | string | ❌ | 事件分类 |
| `value` | number | ❌ | 事件值 |
| `data` | object | ❌ | 事件数据 |

#### 示例

```json
{
  "type": "CUSTOM",
  "name": "order_completed",
  "category": "business",
  "value": 299.99,
  "data": {
    "orderId": "ORD-2021-12345",
    "items": [
      {
        "productId": "PROD-001",
        "name": "智能手机",
        "price": 199.99,
        "quantity": 1
      }
    ],
    "paymentMethod": "credit_card"
  },
  "timestamp": 1640996100000,
  "url": "https://example.com/order/success",
  "userAgent": "Mozilla/5.0...",
  "projectId": "project_demo",
  "version": "1.2.3",
  "environment": "production"
}
```

## 批量上报格式

为了提高上报效率，支持批量上报多个事件。

### 格式结构

```json
{
  "batch": true,
  "batchId": "batch_20211231_001",
  "timestamp": 1640996300000,
  "items": [
    {
      "type": "BEHAVIOR",
      "category": "CLICK",
      "action": "button_click",
      "timestamp": 1640996250000
    },
    {
      "type": "ERROR",
      "category": "JS_ERROR",
      "message": "TypeError: Cannot read property",
      "timestamp": 1640996280000
    }
  ],
  "metadata": {
    "userId": "user_batch",
    "sessionId": "session_batch",
    "projectId": "project_demo",
    "version": "1.2.3",
    "environment": "production",
    "sdkVersion": "2.0.0"
  }
}
```

### 字段说明

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `batch` | boolean | ✅ | 固定值 `true` |
| `batchId` | string | ✅ | 批次ID |
| `timestamp` | number | ✅ | 批次时间戳 |
| `items` | array | ✅ | 事件列表 |
| `metadata` | object | ✅ | 批次元数据 |

## 数据验证

### JSON Schema

项目提供了完整的 JSON Schema 文件 (`data-format-schema.json`)，可用于：

1. 数据格式验证
2. API文档生成
3. 编辑器自动补全
4. 单元测试验证

### TypeScript 类型

提供了完整的 TypeScript 类型定义 (`data-format.d.ts`)，包括：

1. 所有数据结构的类型定义
2. 枚举类型和联合类型
3. 泛型支持
4. 工具类型

## 最佳实践

### 1. 数据大小控制

- 单个事件数据不超过 100KB
- 批量上报每批不超过 100 个事件
- 字符串字段合理截断，避免过长

### 2. 敏感信息处理

- 不要上报密码、令牌等敏感信息
- 对个人信息进行脱敏处理
- 遵循数据隐私法规要求

### 3. 性能优化

- 使用批量上报减少请求次数
- 在空闲时间进行数据上报
- 合理设置采样率

### 4. 错误处理

- 实现上报失败的重试机制
- 本地缓存未成功上报的数据
- 监控SDK自身的错误

### 5. 数据质量

- 实施数据验证和清洗
- 去除重复和无效数据
- 保持数据格式的一致性

## 版本兼容性

### 向后兼容

- 新字段为可选字段，不影响旧版本
- 废弃字段保持支持一个大版本周期
- 提供数据格式迁移工具

### 版本升级

- 遵循语义化版本规范
- 提前通知破坏性变更
- 提供详细的升级指南

## 相关文件

- `data-format.json` - 格式规范定义
- `data-format-examples.json` - 完整示例
- `data-format-schema.json` - JSON Schema 验证规范
- `data-format.d.ts` - TypeScript 类型定义
- `js-error-demo.html` - 交互式演示页面
- `error-server.js` - 数据接收服务器示例

## 更新历史

### v2.0.0 (2024-01-01)
- 重新设计数据格式结构
- 增加批量上报支持
- 完善 TypeScript 类型定义
- 新增 JSON Schema 验证

### v1.0.0 (2023-06-01)
- 初始版本发布
- 基础错误和性能监控格式