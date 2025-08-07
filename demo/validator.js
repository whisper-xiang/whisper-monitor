/**
 * Whisper Monitor 数据格式验证器
 * 用于验证上报数据是否符合规范格式
 */

class DataFormatValidator {
  constructor() {
    this.schemas = {};
    this.loadSchemas();
  }

  // 加载验证规则
  loadSchemas() {
    // 基础类型验证
    this.schemas.timestamp = (value) => 
      typeof value === 'number' && value > 0 && Number.isInteger(value);
    
    this.schemas.url = (value) => {
      if (typeof value !== 'string') return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    };

    this.schemas.userAgent = (value) => 
      typeof value === 'string' && value.length > 0;

    this.schemas.environment = (value) => 
      ['development', 'staging', 'production'].includes(value);

    this.schemas.level = (value) => 
      ['debug', 'info', 'warning', 'error', 'fatal'].includes(value);

    this.schemas.httpMethod = (value) => 
      ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(value);

    this.schemas.version = (value) => 
      typeof value === 'string' && /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)*$/.test(value);
  }

  // 验证通用字段
  validateCommonFields(data) {
    const errors = [];

    // 必需字段验证
    const requiredFields = ['timestamp', 'url', 'userAgent', 'projectId', 'version', 'environment'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // 字段类型验证
    if ('timestamp' in data && !this.schemas.timestamp(data.timestamp)) {
      errors.push('Invalid timestamp: must be a positive integer');
    }

    if ('url' in data && !this.schemas.url(data.url)) {
      errors.push('Invalid url: must be a valid URL');
    }

    if ('userAgent' in data && !this.schemas.userAgent(data.userAgent)) {
      errors.push('Invalid userAgent: must be a non-empty string');
    }

    if ('environment' in data && !this.schemas.environment(data.environment)) {
      errors.push('Invalid environment: must be development, staging, or production');
    }

    if ('level' in data && !this.schemas.level(data.level)) {
      errors.push('Invalid level: must be debug, info, warning, error, or fatal');
    }

    if ('version' in data && !this.schemas.version(data.version)) {
      errors.push('Invalid version: must follow semantic versioning (e.g., 1.2.3)');
    }

    // 可选字段验证
    if ('deviceInfo' in data) {
      const deviceErrors = this.validateDeviceInfo(data.deviceInfo);
      errors.push(...deviceErrors);
    }

    if ('breadcrumbs' in data) {
      const breadcrumbErrors = this.validateBreadcrumbs(data.breadcrumbs);
      errors.push(...breadcrumbErrors);
    }

    return errors;
  }

  // 验证设备信息
  validateDeviceInfo(deviceInfo) {
    const errors = [];
    
    if (typeof deviceInfo !== 'object' || deviceInfo === null) {
      return ['deviceInfo must be an object'];
    }

    const validPlatforms = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'iPadOS'];
    const validBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'IE', 'Other'];

    if ('platform' in deviceInfo && !validPlatforms.includes(deviceInfo.platform)) {
      errors.push(`Invalid platform: must be one of ${validPlatforms.join(', ')}`);
    }

    if ('browser' in deviceInfo && !validBrowsers.includes(deviceInfo.browser)) {
      errors.push(`Invalid browser: must be one of ${validBrowsers.join(', ')}`);
    }

    const numericFields = ['screenWidth', 'screenHeight', 'viewportWidth', 'viewportHeight'];
    for (const field of numericFields) {
      if (field in deviceInfo && (typeof deviceInfo[field] !== 'number' || deviceInfo[field] < 0)) {
        errors.push(`Invalid ${field}: must be a non-negative number`);
      }
    }

    if ('language' in deviceInfo && !/^[a-z]{2}(-[A-Z]{2})?$/.test(deviceInfo.language)) {
      errors.push('Invalid language: must follow ISO 639-1 format (e.g., zh-CN)');
    }

    return errors;
  }

  // 验证面包屑
  validateBreadcrumbs(breadcrumbs) {
    const errors = [];

    if (!Array.isArray(breadcrumbs)) {
      return ['breadcrumbs must be an array'];
    }

    if (breadcrumbs.length > 20) {
      errors.push('breadcrumbs array cannot exceed 20 items');
    }

    const validTypes = ['click', 'navigation', 'request', 'console', 'error', 'custom'];

    breadcrumbs.forEach((breadcrumb, index) => {
      if (typeof breadcrumb !== 'object' || breadcrumb === null) {
        errors.push(`breadcrumbs[${index}] must be an object`);
        return;
      }

      if (!('type' in breadcrumb)) {
        errors.push(`breadcrumbs[${index}] missing required field: type`);
      } else if (!validTypes.includes(breadcrumb.type)) {
        errors.push(`breadcrumbs[${index}] invalid type: must be one of ${validTypes.join(', ')}`);
      }

      if (!('message' in breadcrumb)) {
        errors.push(`breadcrumbs[${index}] missing required field: message`);
      } else if (typeof breadcrumb.message !== 'string' || breadcrumb.message.length > 500) {
        errors.push(`breadcrumbs[${index}] invalid message: must be a string with max 500 characters`);
      }

      if (!('timestamp' in breadcrumb)) {
        errors.push(`breadcrumbs[${index}] missing required field: timestamp`);
      } else if (!this.schemas.timestamp(breadcrumb.timestamp)) {
        errors.push(`breadcrumbs[${index}] invalid timestamp: must be a positive integer`);
      }
    });

    return errors;
  }

  // 验证错误上报格式
  validateErrorReport(data) {
    const errors = [];

    // 验证通用字段
    errors.push(...this.validateCommonFields(data));

    // 验证错误特定字段
    if (data.type !== 'ERROR') {
      errors.push('Invalid type: must be ERROR');
    }

    const validCategories = ['JS_ERROR', 'RESOURCE_ERROR', 'PROMISE_ERROR', 'NETWORK_ERROR', 'CUSTOM_ERROR'];
    if (!('category' in data)) {
      errors.push('Missing required field: category');
    } else if (!validCategories.includes(data.category)) {
      errors.push(`Invalid category: must be one of ${validCategories.join(', ')}`);
    }

    if (!('message' in data)) {
      errors.push('Missing required field: message');
    } else if (typeof data.message !== 'string' || data.message.length > 1000) {
      errors.push('Invalid message: must be a string with max 1000 characters');
    }

    // 验证堆栈信息
    if ('stack' in data) {
      const stackErrors = this.validateStack(data.stack);
      errors.push(...stackErrors);
    }

    // 验证资源错误信息
    if ('resource' in data) {
      const resourceErrors = this.validateResourceInfo(data.resource);
      errors.push(...resourceErrors);
    }

    return errors;
  }

  // 验证堆栈信息
  validateStack(stack) {
    const errors = [];

    if (!Array.isArray(stack)) {
      return ['stack must be an array'];
    }

    if (stack.length > 20) {
      errors.push('stack array cannot exceed 20 items');
    }

    stack.forEach((frame, index) => {
      if (typeof frame !== 'object' || frame === null) {
        errors.push(`stack[${index}] must be an object`);
        return;
      }

      const requiredFields = ['functionName', 'filename', 'lineno', 'colno'];
      for (const field of requiredFields) {
        if (!(field in frame)) {
          errors.push(`stack[${index}] missing required field: ${field}`);
        }
      }

      if ('lineno' in frame && (typeof frame.lineno !== 'number' || frame.lineno < 0)) {
        errors.push(`stack[${index}] invalid lineno: must be a non-negative number`);
      }

      if ('colno' in frame && (typeof frame.colno !== 'number' || frame.colno < 0)) {
        errors.push(`stack[${index}] invalid colno: must be a non-negative number`);
      }
    });

    return errors;
  }

  // 验证资源信息
  validateResourceInfo(resource) {
    const errors = [];

    if (typeof resource !== 'object' || resource === null) {
      return ['resource must be an object'];
    }

    if (!('tagName' in resource)) {
      errors.push('resource missing required field: tagName');
    }

    if (!('url' in resource)) {
      errors.push('resource missing required field: url');
    } else if (!this.schemas.url(resource.url)) {
      errors.push('resource invalid url: must be a valid URL');
    }

    if ('outerHTML' in resource && (typeof resource.outerHTML !== 'string' || resource.outerHTML.length > 2000)) {
      errors.push('resource invalid outerHTML: must be a string with max 2000 characters');
    }

    return errors;
  }

  // 验证性能上报格式
  validatePerformanceReport(data) {
    const errors = [];

    // 验证通用字段
    errors.push(...this.validateCommonFields(data));

    // 验证性能特定字段
    if (data.type !== 'PERFORMANCE') {
      errors.push('Invalid type: must be PERFORMANCE');
    }

    const validCategories = ['NAVIGATION', 'RESOURCE', 'VITALS', 'LONG_TASK'];
    if (!('category' in data)) {
      errors.push('Missing required field: category');
    } else if (!validCategories.includes(data.category)) {
      errors.push(`Invalid category: must be one of ${validCategories.join(', ')}`);
    }

    // 验证性能指标
    if ('metrics' in data) {
      const metricsErrors = this.validatePerformanceMetrics(data.metrics);
      errors.push(...metricsErrors);
    }

    // 验证资源信息
    if ('resources' in data) {
      const resourcesErrors = this.validateResourceMetrics(data.resources);
      errors.push(...resourcesErrors);
    }

    return errors;
  }

  // 验证性能指标
  validatePerformanceMetrics(metrics) {
    const errors = [];

    if (typeof metrics !== 'object' || metrics === null) {
      return ['metrics must be an object'];
    }

    const validMetrics = ['fcp', 'lcp', 'fid', 'cls', 'ttfb', 'domContentLoaded', 'loadComplete'];
    
    for (const [key, value] of Object.entries(metrics)) {
      if (!validMetrics.includes(key)) {
        errors.push(`Invalid metric: ${key}`);
      }

      if (typeof value !== 'number' || value < 0) {
        errors.push(`Invalid metric value for ${key}: must be a non-negative number`);
      }
    }

    return errors;
  }

  // 验证资源指标
  validateResourceMetrics(resources) {
    const errors = [];

    if (!Array.isArray(resources)) {
      return ['resources must be an array'];
    }

    resources.forEach((resource, index) => {
      if (typeof resource !== 'object' || resource === null) {
        errors.push(`resources[${index}] must be an object`);
        return;
      }

      const requiredFields = ['name', 'type', 'duration'];
      for (const field of requiredFields) {
        if (!(field in resource)) {
          errors.push(`resources[${index}] missing required field: ${field}`);
        }
      }

      if ('duration' in resource && (typeof resource.duration !== 'number' || resource.duration < 0)) {
        errors.push(`resources[${index}] invalid duration: must be a non-negative number`);
      }

      if ('size' in resource && (typeof resource.size !== 'number' || resource.size < 0)) {
        errors.push(`resources[${index}] invalid size: must be a non-negative number`);
      }
    });

    return errors;
  }

  // 验证行为上报格式
  validateBehaviorReport(data) {
    const errors = [];

    // 验证通用字段
    errors.push(...this.validateCommonFields(data));

    // 验证行为特定字段
    if (data.type !== 'BEHAVIOR') {
      errors.push('Invalid type: must be BEHAVIOR');
    }

    const validCategories = ['CLICK', 'NAVIGATION', 'SCROLL', 'INPUT', 'CUSTOM'];
    if (!('category' in data)) {
      errors.push('Missing required field: category');
    } else if (!validCategories.includes(data.category)) {
      errors.push(`Invalid category: must be one of ${validCategories.join(', ')}`);
    }

    if (!('action' in data)) {
      errors.push('Missing required field: action');
    } else if (typeof data.action !== 'string' || data.action.length > 100) {
      errors.push('Invalid action: must be a string with max 100 characters');
    }

    // 验证目标元素信息
    if ('target' in data) {
      const targetErrors = this.validateElementTarget(data.target);
      errors.push(...targetErrors);
    }

    // 验证位置信息
    if ('position' in data) {
      const positionErrors = this.validatePosition(data.position);
      errors.push(...positionErrors);
    }

    return errors;
  }

  // 验证元素目标
  validateElementTarget(target) {
    const errors = [];

    if (typeof target !== 'object' || target === null) {
      return ['target must be an object'];
    }

    if (!('tagName' in target)) {
      errors.push('target missing required field: tagName');
    }

    if ('textContent' in target && (typeof target.textContent !== 'string' || target.textContent.length > 200)) {
      errors.push('target invalid textContent: must be a string with max 200 characters');
    }

    return errors;
  }

  // 验证位置信息
  validatePosition(position) {
    const errors = [];

    if (typeof position !== 'object' || position === null) {
      return ['position must be an object'];
    }

    const requiredFields = ['x', 'y'];
    for (const field of requiredFields) {
      if (!(field in position)) {
        errors.push(`position missing required field: ${field}`);
      } else if (typeof position[field] !== 'number') {
        errors.push(`position invalid ${field}: must be a number`);
      }
    }

    return errors;
  }

  // 验证API上报格式
  validateApiReport(data) {
    const errors = [];

    // 验证通用字段
    errors.push(...this.validateCommonFields(data));

    // 验证API特定字段
    if (data.type !== 'API') {
      errors.push('Invalid type: must be API');
    }

    const validCategories = ['XHR', 'FETCH', 'WEBSOCKET'];
    if (!('category' in data)) {
      errors.push('Missing required field: category');
    } else if (!validCategories.includes(data.category)) {
      errors.push(`Invalid category: must be one of ${validCategories.join(', ')}`);
    }

    if (!('method' in data)) {
      errors.push('Missing required field: method');
    } else if (!this.schemas.httpMethod(data.method)) {
      errors.push('Invalid method: must be a valid HTTP method');
    }

    if (!('url' in data)) {
      errors.push('Missing required field: url');
    } else if (!this.schemas.url(data.url)) {
      errors.push('Invalid url: must be a valid URL');
    }

    if (!('status' in data)) {
      errors.push('Missing required field: status');
    } else if (typeof data.status !== 'number' || data.status < 100 || data.status > 599) {
      errors.push('Invalid status: must be a number between 100 and 599');
    }

    if (!('duration' in data)) {
      errors.push('Missing required field: duration');
    } else if (typeof data.duration !== 'number' || data.duration < 0) {
      errors.push('Invalid duration: must be a non-negative number');
    }

    // 验证请求体和响应体长度
    if ('requestBody' in data && (typeof data.requestBody !== 'string' || data.requestBody.length > 10000)) {
      errors.push('Invalid requestBody: must be a string with max 10000 characters');
    }

    if ('responseBody' in data && (typeof data.responseBody !== 'string' || data.responseBody.length > 10000)) {
      errors.push('Invalid responseBody: must be a string with max 10000 characters');
    }

    return errors;
  }

  // 验证自定义事件格式
  validateCustomReport(data) {
    const errors = [];

    // 验证通用字段
    errors.push(...this.validateCommonFields(data));

    // 验证自定义事件特定字段
    if (data.type !== 'CUSTOM') {
      errors.push('Invalid type: must be CUSTOM');
    }

    if (!('name' in data)) {
      errors.push('Missing required field: name');
    } else if (typeof data.name !== 'string' || data.name.length > 100) {
      errors.push('Invalid name: must be a string with max 100 characters');
    }

    if ('category' in data && (typeof data.category !== 'string' || data.category.length > 50)) {
      errors.push('Invalid category: must be a string with max 50 characters');
    }

    if ('value' in data && typeof data.value !== 'number') {
      errors.push('Invalid value: must be a number');
    }

    return errors;
  }

  // 验证批量上报格式
  validateBatchReport(data) {
    const errors = [];

    if (data.batch !== true) {
      errors.push('Invalid batch: must be true');
    }

    if (!('batchId' in data)) {
      errors.push('Missing required field: batchId');
    } else if (typeof data.batchId !== 'string' || data.batchId.length > 100) {
      errors.push('Invalid batchId: must be a string with max 100 characters');
    }

    if (!('timestamp' in data)) {
      errors.push('Missing required field: timestamp');
    } else if (!this.schemas.timestamp(data.timestamp)) {
      errors.push('Invalid timestamp: must be a positive integer');
    }

    if (!('items' in data)) {
      errors.push('Missing required field: items');
    } else if (!Array.isArray(data.items)) {
      errors.push('Invalid items: must be an array');
    } else {
      if (data.items.length === 0) {
        errors.push('Invalid items: array cannot be empty');
      } else if (data.items.length > 100) {
        errors.push('Invalid items: array cannot exceed 100 items');
      }

      // 验证每个项目
      data.items.forEach((item, index) => {
        const itemErrors = this.validate(item);
        itemErrors.forEach(error => {
          errors.push(`items[${index}] ${error}`);
        });
      });
    }

    if (!('metadata' in data)) {
      errors.push('Missing required field: metadata');
    } else {
      const metadataErrors = this.validateBatchMetadata(data.metadata);
      errors.push(...metadataErrors);
    }

    return errors;
  }

  // 验证批量上报元数据
  validateBatchMetadata(metadata) {
    const errors = [];

    if (typeof metadata !== 'object' || metadata === null) {
      return ['metadata must be an object'];
    }

    const requiredFields = ['projectId', 'version', 'environment'];
    for (const field of requiredFields) {
      if (!(field in metadata)) {
        errors.push(`metadata missing required field: ${field}`);
      }
    }

    if ('environment' in metadata && !this.schemas.environment(metadata.environment)) {
      errors.push('metadata invalid environment: must be development, staging, or production');
    }

    if ('version' in metadata && !this.schemas.version(metadata.version)) {
      errors.push('metadata invalid version: must follow semantic versioning');
    }

    return errors;
  }

  // 主验证方法
  validate(data) {
    if (typeof data !== 'object' || data === null) {
      return ['Data must be an object'];
    }

    // 批量上报格式
    if (data.batch === true) {
      return this.validateBatchReport(data);
    }

    // 根据类型选择验证方法
    switch (data.type) {
      case 'ERROR':
        return this.validateErrorReport(data);
      case 'PERFORMANCE':
        return this.validatePerformanceReport(data);
      case 'BEHAVIOR':
        return this.validateBehaviorReport(data);
      case 'API':
        return this.validateApiReport(data);
      case 'CUSTOM':
        return this.validateCustomReport(data);
      default:
        return ['Invalid type: must be one of ERROR, PERFORMANCE, BEHAVIOR, API, CUSTOM'];
    }
  }

  // 验证并返回结果
  validateWithResult(data) {
    const errors = this.validate(data);
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

// 导出验证器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataFormatValidator;
} else if (typeof window !== 'undefined') {
  window.DataFormatValidator = DataFormatValidator;
}

// 使用示例
/*
const validator = new DataFormatValidator();

const errorData = {
  type: 'ERROR',
  category: 'JS_ERROR',
  message: 'Cannot read property of null',
  timestamp: Date.now(),
  url: 'https://example.com',
  userAgent: 'Mozilla/5.0...',
  projectId: 'demo',
  version: '1.0.0',
  environment: 'production'
};

const result = validator.validateWithResult(errorData);
console.log('Valid:', result.valid);
console.log('Errors:', result.errors);
*/