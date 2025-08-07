# JavaScript异常监控Demo

这是一个完整的JavaScript异常数据上报格式demo，展示了如何监控和上报前端错误。

## 功能特性

### 🔍 错误监控类型
- **JavaScript运行时错误**: 语法错误、引用错误、类型错误等
- **Promise未捕获错误**: async/await和Promise中的异常
- **资源加载错误**: 图片、脚本、样式表等资源加载失败
- **自定义错误**: 业务逻辑中抛出的自定义异常

### 📊 数据上报格式
```json
{
  "type": "ERROR",
  "category": "JS_ERROR",
  "message": "错误消息",
  "filename": "出错文件路径",
  "lineno": 123,
  "colno": 45,
  "stack": [
    {
      "functionName": "函数名",
      "filename": "文件路径",
      "lineno": 123,
      "colno": 45
    }
  ],
  "timestamp": 1640995200000,
  "url": "当前页面URL",
  "userAgent": "浏览器信息",
  "breadcrumbs": [
    {
      "type": "click",
      "message": "用户行为描述",
      "timestamp": 1640995200000
    }
  ],
  "userId": "12345",
  "projectId": "demo-project",
  "version": "1.0.0",
  "environment": "development"
}
```

### 🛠️ 核心功能
- **错误堆栈解析**: 自动解析错误堆栈信息
- **面包屑记录**: 记录用户操作轨迹
- **错误分类**: 自动分类不同类型的错误
- **数据上报**: 支持多种上报方式（XHR、Fetch、Beacon）
- **错误去重**: 基于错误指纹进行去重
- **统计分析**: 提供错误统计和分析面板

## 快速开始

### 1. 安装依赖
```bash
cd demo
npm install
```

### 2. 启动服务器
```bash
npm start
```

### 3. 访问Demo
- **错误监控Demo**: http://localhost:3000/
- **错误统计面板**: http://localhost:3000/dashboard

## 使用说明

### 前端监控
1. 打开错误监控Demo页面
2. 点击不同的按钮触发各种类型的错误
3. 查看页面上的实时错误日志
4. 观察错误数据的完整格式

### 后端管理
1. 访问错误统计面板
2. 查看错误统计数据和趋势
3. 按分类和严重程度筛选错误
4. 查看详细的错误信息和堆栈

## API接口

### 上报错误
```
POST /api/errors
Content-Type: application/json

{
  "type": "ERROR",
  "category": "JS_ERROR",
  "message": "错误消息",
  // ... 其他字段
}
```

### 获取错误列表
```
GET /api/errors?page=1&limit=20&category=JS_ERROR&severity=error
```

### 获取错误统计
```
GET /api/errors/stats
```

### 获取错误详情
```
GET /api/errors/:id
```

### 清空错误日志
```
DELETE /api/errors
```

## 错误分类

### 1. JavaScript错误 (JS_ERROR)
- **SyntaxError**: 语法错误
- **ReferenceError**: 引用错误
- **TypeError**: 类型错误
- **RangeError**: 范围错误

### 2. Promise错误 (PROMISE_ERROR)
- 未捕获的Promise异常
- async/await中的错误

### 3. 资源错误 (RESOURCE_ERROR)
- 图片加载失败
- 脚本加载失败
- 样式表加载失败

## 错误严重程度

- **error**: 严重错误，需要立即处理
- **warning**: 警告级别，可能影响用户体验
- **info**: 信息级别，用于调试和分析

## 面包屑记录

面包屑功能记录用户在错误发生前的操作轨迹：

```json
{
  "breadcrumbs": [
    {
      "type": "click",
      "message": "用户点击了触发错误按钮",
      "timestamp": 1640995200000
    },
    {
      "type": "navigation",
      "message": "用户访问了页面",
      "timestamp": 1640995100000
    }
  ]
}
```

## 自定义配置

```javascript
const monitor = new ErrorMonitor({
  reportUrl: 'http://localhost:3000/api/errors',
  maxStackFrames: 5,
  enableBreadcrumb: true,
  globalData: {
    userId: '12345',
    projectId: 'your-project',
    version: '1.0.0',
    environment: 'production'
  }
});
```

## 集成到现有项目

### 1. 引入监控代码
```javascript
// 复制 js-error-demo.html 中的 ErrorMonitor 类
// 或者使用 whisper-monitor SDK
import { init, jsErrorPlugin } from 'whisper-monitor';

const monitor = init({
  reportOptions: {
    url: 'your-api-endpoint',
    method: 'xhr',
    payloadType: 'json'
  },
  plugins: [jsErrorPlugin]
});
```

### 2. 配置后端接收
```javascript
// 使用 Express.js 接收错误数据
app.post('/api/errors', (req, res) => {
  const errorData = req.body;
  // 处理错误数据
  console.log('收到错误:', errorData);
  res.json({ success: true });
});
```

## 注意事项

1. **跨域配置**: 确保服务器支持跨域请求
2. **数据量控制**: 避免发送过大的错误数据
3. **频率限制**: 实现错误上报的频率限制
4. **隐私保护**: 避免上报敏感用户信息
5. **性能影响**: 监控代码应尽量减少对页面性能的影响

## 扩展功能

- **错误聚合**: 相同错误的聚合统计
- **告警通知**: 错误达到阈值时发送通知
- **用户影响分析**: 分析错误对用户的影响程度
- **修复建议**: 基于错误类型提供修复建议