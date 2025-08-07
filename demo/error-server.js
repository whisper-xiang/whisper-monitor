const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// 错误数据存储文件
const errorLogFile = path.join(__dirname, 'error-logs.json');

// 初始化错误日志文件
if (!fs.existsSync(errorLogFile)) {
    fs.writeFileSync(errorLogFile, JSON.stringify([], null, 2));
}

// 读取错误日志
function readErrorLogs() {
    try {
        const data = fs.readFileSync(errorLogFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取错误日志失败:', error);
        return [];
    }
}

// 写入错误日志
function writeErrorLogs(logs) {
    try {
        fs.writeFileSync(errorLogFile, JSON.stringify(logs, null, 2));
        return true;
    } catch (error) {
        console.error('写入错误日志失败:', error);
        return false;
    }
}

// 格式化错误数据
function formatErrorData(errorData) {
    return {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        receivedAt: new Date().toISOString(),
        ...errorData,
        // 添加服务器端处理的字段
        processed: true,
        severity: getSeverity(errorData),
        fingerprint: generateFingerprint(errorData)
    };
}

// 获取错误严重程度
function getSeverity(errorData) {
    const { category, message } = errorData;
    
    if (category === 'RESOURCE_ERROR') return 'warning';
    if (message && message.includes('Script error')) return 'info';
    if (category === 'PROMISE_ERROR') return 'error';
    if (category === 'JS_ERROR') return 'error';
    
    return 'error';
}

// 生成错误指纹（用于去重）
function generateFingerprint(errorData) {
    const { message, filename, lineno, category } = errorData;
    const key = `${category}-${message}-${filename}-${lineno}`;
    return require('crypto').createHash('md5').update(key).digest('hex');
}

// 错误统计
function getErrorStats(logs) {
    const stats = {
        total: logs.length,
        byCategory: {},
        bySeverity: {},
        byHour: {},
        recent: logs.slice(-10).reverse()
    };

    logs.forEach(log => {
        // 按分类统计
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
        
        // 按严重程度统计
        stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
        
        // 按小时统计
        const hour = new Date(log.timestamp).getHours();
        stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    });

    return stats;
}

// API路由

// 接收错误数据
app.post('/api/errors', (req, res) => {
    const errorData = req.body;
    
    console.log('收到错误数据:', {
        type: errorData.type,
        category: errorData.category,
        message: errorData.message,
        timestamp: new Date(errorData.timestamp).toLocaleString()
    });

    // 格式化并存储错误数据
    const formattedError = formatErrorData(errorData);
    const logs = readErrorLogs();
    logs.push(formattedError);
    
    // 保持最近1000条记录
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    
    const success = writeErrorLogs(logs);
    
    if (success) {
        res.json({
            success: true,
            message: '错误数据已接收',
            errorId: formattedError.id
        });
    } else {
        res.status(500).json({
            success: false,
            message: '保存错误数据失败'
        });
    }
});

// 获取错误列表
app.get('/api/errors', (req, res) => {
    const { page = 1, limit = 20, category, severity } = req.query;
    let logs = readErrorLogs();
    
    // 过滤
    if (category) {
        logs = logs.filter(log => log.category === category);
    }
    if (severity) {
        logs = logs.filter(log => log.severity === severity);
    }
    
    // 排序（最新的在前）
    logs.sort((a, b) => b.timestamp - a.timestamp);
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = logs.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: paginatedLogs,
        total: logs.length,
        page: parseInt(page),
        limit: parseInt(limit)
    });
});

// 获取错误统计
app.get('/api/errors/stats', (req, res) => {
    const logs = readErrorLogs();
    const stats = getErrorStats(logs);
    
    res.json({
        success: true,
        data: stats
    });
});

// 获取单个错误详情
app.get('/api/errors/:id', (req, res) => {
    const { id } = req.params;
    const logs = readErrorLogs();
    const error = logs.find(log => log.id === id);
    
    if (error) {
        res.json({
            success: true,
            data: error
        });
    } else {
        res.status(404).json({
            success: false,
            message: '错误记录未找到'
        });
    }
});

// 清空错误日志
app.delete('/api/errors', (req, res) => {
    const success = writeErrorLogs([]);
    
    if (success) {
        res.json({
            success: true,
            message: '错误日志已清空'
        });
    } else {
        res.status(500).json({
            success: false,
            message: '清空错误日志失败'
        });
    }
});

// 错误管理面板
app.get('/dashboard', (req, res) => {
    const dashboardHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>错误监控面板</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 20px; 
        }
        .stat-card { 
            background: white; 
            padding: 20px; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; margin-top: 5px; }
        .error-list { 
            background: white; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .error-item { 
            padding: 15px; 
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .error-item:last-child { border-bottom: none; }
        .error-info h4 { margin-bottom: 5px; }
        .error-meta { color: #666; font-size: 0.9em; }
        .severity { 
            padding: 4px 8px; 
            border-radius: 4px; 
            color: white; 
            font-size: 0.8em;
            font-weight: bold;
        }
        .severity.error { background: #dc3545; }
        .severity.warning { background: #ffc107; color: #333; }
        .severity.info { background: #17a2b8; }
        .controls { 
            padding: 20px; 
            background: white; 
            border-radius: 8px 8px 0 0;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        button { 
            padding: 8px 16px; 
            border: none; 
            border-radius: 4px; 
            background: #007bff; 
            color: white; 
            cursor: pointer;
        }
        button:hover { background: #0056b3; }
        button.danger { background: #dc3545; }
        button.danger:hover { background: #c82333; }
        select { 
            padding: 8px; 
            border: 1px solid #ddd; 
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>错误监控面板</h1>
            <p>实时监控前端错误和异常</p>
        </div>

        <div class="stats-grid" id="statsGrid">
            <!-- 统计数据将在这里显示 -->
        </div>

        <div class="error-list">
            <div class="controls">
                <select id="categoryFilter">
                    <option value="">所有分类</option>
                    <option value="JS_ERROR">JS错误</option>
                    <option value="RESOURCE_ERROR">资源错误</option>
                    <option value="PROMISE_ERROR">Promise错误</option>
                </select>
                <select id="severityFilter">
                    <option value="">所有级别</option>
                    <option value="error">错误</option>
                    <option value="warning">警告</option>
                    <option value="info">信息</option>
                </select>
                <button onclick="loadErrors()">刷新</button>
                <button class="danger" onclick="clearErrors()">清空日志</button>
            </div>
            <div id="errorList">
                <!-- 错误列表将在这里显示 -->
            </div>
        </div>
    </div>

    <script>
        let currentErrors = [];

        // 加载统计数据
        async function loadStats() {
            try {
                const response = await fetch('/api/errors/stats');
                const result = await response.json();
                
                if (result.success) {
                    displayStats(result.data);
                }
            } catch (error) {
                console.error('加载统计数据失败:', error);
            }
        }

        // 显示统计数据
        function displayStats(stats) {
            const statsGrid = document.getElementById('statsGrid');
            statsGrid.innerHTML = \`
                <div class="stat-card">
                    <div class="stat-value">\${stats.total}</div>
                    <div class="stat-label">总错误数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">\${stats.bySeverity.error || 0}</div>
                    <div class="stat-label">严重错误</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">\${stats.bySeverity.warning || 0}</div>
                    <div class="stat-label">警告</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">\${Object.keys(stats.byCategory).length}</div>
                    <div class="stat-label">错误类型</div>
                </div>
            \`;
        }

        // 加载错误列表
        async function loadErrors() {
            const category = document.getElementById('categoryFilter').value;
            const severity = document.getElementById('severityFilter').value;
            
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (severity) params.append('severity', severity);
            params.append('limit', '50');

            try {
                const response = await fetch(\`/api/errors?\${params}\`);
                const result = await response.json();
                
                if (result.success) {
                    currentErrors = result.data;
                    displayErrors(result.data);
                }
            } catch (error) {
                console.error('加载错误列表失败:', error);
            }
        }

        // 显示错误列表
        function displayErrors(errors) {
            const errorList = document.getElementById('errorList');
            
            if (errors.length === 0) {
                errorList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">暂无错误记录</div>';
                return;
            }

            errorList.innerHTML = errors.map(error => \`
                <div class="error-item">
                    <div class="error-info">
                        <h4>\${error.message}</h4>
                        <div class="error-meta">
                            \${error.filename ? \`文件: \${error.filename}:\${error.lineno}:\${error.colno}\` : ''}
                            | 时间: \${new Date(error.timestamp).toLocaleString()}
                            | ID: \${error.id}
                        </div>
                    </div>
                    <div>
                        <span class="severity \${error.severity}">\${error.severity.toUpperCase()}</span>
                    </div>
                </div>
            \`).join('');
        }

        // 清空错误日志
        async function clearErrors() {
            if (!confirm('确定要清空所有错误日志吗？')) return;
            
            try {
                const response = await fetch('/api/errors', { method: 'DELETE' });
                const result = await response.json();
                
                if (result.success) {
                    alert('错误日志已清空');
                    loadErrors();
                    loadStats();
                }
            } catch (error) {
                console.error('清空错误日志失败:', error);
                alert('清空失败');
            }
        }

        // 初始化
        document.addEventListener('DOMContentLoaded', () => {
            loadStats();
            loadErrors();
            
            // 添加过滤器事件监听
            document.getElementById('categoryFilter').addEventListener('change', loadErrors);
            document.getElementById('severityFilter').addEventListener('change', loadErrors);
            
            // 定时刷新
            setInterval(() => {
                loadStats();
                loadErrors();
            }, 30000);
        });
    </script>
</body>
</html>
    `;
    
    res.send(dashboardHTML);
});

// 提供demo页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'js-error-demo.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`\n🚀 错误监控服务器已启动!`);
    console.log(`📊 监控面板: http://localhost:${PORT}/dashboard`);
    console.log(`🧪 错误Demo: http://localhost:${PORT}/`);
    console.log(`📡 API接口: http://localhost:${PORT}/api/errors`);
    console.log(`\n💡 使用说明:`);
    console.log(`   1. 访问 http://localhost:${PORT}/ 查看错误监控demo`);
    console.log(`   2. 访问 http://localhost:${PORT}/dashboard 查看错误统计面板`);
    console.log(`   3. 点击demo页面的按钮触发各种错误类型`);
    console.log(`   4. 在面板中查看错误统计和详细信息\n`);
});

module.exports = app;