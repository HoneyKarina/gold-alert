# Gold Alert API 文档

## 📡 API 概览

Gold Alert 提供完整的 REST API 接口，支持获取实时价格、历史数据、管理预警规则等功能。

**基础 URL**: `http://localhost:3000`

**响应格式**: JSON

**认证**: 目前无需认证，生产环境建议添加 API Key

---

## 🏗️ API 端点总览

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/price` | GET | 获取当前金价 |
| `/api/history` | GET | 获取历史价格数据 |
| `/api/alerts` | GET | 获取所有预警规则 |
| `/api/alerts` | POST | 创建新预警规则 |
| `/api/alerts/:id` | PUT | 更新预警规则 |
| `/api/alerts/:id` | DELETE | 删除预警规则 |
| `/api/status` | GET | 系统状态 |
| `/api/config` | GET | 系统配置 |

---

## 📊 价格相关 API

### 获取当前金价

```http
GET /api/price
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "price": 3022.50,
    "change": 28.50,
    "changePercent": 0.95,
    "timestamp": "2026-04-01T03:00:00Z",
    "source": "Kitco",
    "unit": "USD/oz"
  }
}
```

#### 字段说明
| 字段 | 类型 | 描述 |
|------|------|------|
| `price` | number | 当前金价（美元/盎司） |
| `change` | number | 价格变化（美元） |
| `changePercent` | number | 价格变化百分比 |
| `timestamp` | string | 数据时间戳（ISO 8601） |
| `source` | string | 数据来源 |
| `unit` | string | 计价单位 |

---

### 获取历史数据

```http
GET /api/history?days=7&limit=100
```

#### 查询参数
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `days` | number | 否 | 获取最近 N 天数据（默认：7） |
| `limit` | number | 否 | 限制返回记录数（默认：100，最大：1000） |

#### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": "1775025953882-y2m8idkea",
      "price": 3022.50,
      "change": 28.50,
      "changePercent": 0.95,
      "timestamp": "2026-04-01T03:00:00Z",
      "source": "Kitco"
    },
    {
      "id": "1775025294211-abc123xyz",
      "price": 2994.00,
      "change": -15.20,
      "changePercent": -0.51,
      "timestamp": "2026-03-31T23:00:00Z",
      "source": "Kitco"
    }
  ],
  "meta": {
    "total": 168,
    "limit": 100,
    "days": 7
  }
}
```

---

## 🚨 预警管理 API

### 获取所有预警规则

```http
GET /api/alerts
```

#### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_001",
      "type": "threshold",
      "direction": "above",
      "value": 3100,
      "triggered": false,
      "lastTriggered": null,
      "createdAt": "2026-04-01T10:00:00Z",
      "notificationChannel": "feishu"
    },
    {
      "id": "alert_002",
      "type": "percentage",
      "direction": "below",
      "value": 5,
      "triggered": false,
      "lastTriggered": "2026-03-31T14:30:00Z",
      "createdAt": "2026-03-28T09:00:00Z",
      "notificationChannel": "webhook"
    }
  ]
}
```

#### 预警规则类型
| 类型 | 描述 | 示例值 |
|------|------|--------|
| `threshold` | 绝对价格阈值 | 3000 |
| `percentage` | 百分比阈值 | 5 (表示5%) |

#### 预警方向
| 方向 | 描述 |
|------|------|
| `above` | 价格高于设定值时触发 |
| `below` | 价格低于设定值时触发 |
| `both` | 价格双向波动时触发 |

---

### 创建预警规则

```http
POST /api/alerts
Content-Type: application/json
```

#### 请求体
```json
{
  "type": "threshold",
  "direction": "above",
  "value": 3150,
  "notificationChannel": "feishu"
}
```

#### 字段说明
| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `type` | string | 是 | 预警类型：`threshold` 或 `percentage` |
| `direction` | string | 是 | 预警方向：`above`、`below` 或 `both` |
| `value` | number | 是 | 预警值（绝对值或百分比） |
| `notificationChannel` | string | 是 | 通知渠道：`feishu`、`webhook`、`telegram`、`email` |

#### 响应示例
```json
{
  "success": true,
  "data": {
    "id": "alert_003",
    "type": "threshold",
    "direction": "above",
    "value": 3150,
    "triggered": false,
    "lastTriggered": null,
    "createdAt": "2026-04-01T12:00:00Z",
    "notificationChannel": "feishu"
  }
}
```

---

### 更新预警规则

```http
PUT /api/alerts/:id
Content-Type: application/json
```

#### 请求体
```json
{
  "value": 3200,
  "notificationChannel": "telegram"
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "id": "alert_003",
    "type": "threshold",
    "direction": "above",
    "value": 3200,
    "triggered": false,
    "lastTriggered": null,
    "createdAt": "2026-04-01T12:00:00Z",
    "updatedAt": "2026-04-01T12:30:00Z",
    "notificationChannel": "telegram"
  }
}
```

---

### 删除预警规则

```http
DELETE /api/alerts/:id
```

#### 响应示例
```json
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

---

## 📋 系统管理 API

### 获取系统状态

```http
GET /api/status
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "status": "running",
    "uptime": "2h 30m",
    "lastPriceCheck": "2026-04-01T12:45:00Z",
    "nextPriceCheck": "2026-04-01T13:45:00Z",
    "alertsTriggered": 3,
    "totalChecks": 25,
    "errorRate": 0.0,
    "version": "1.0.0"
  }
}
```

---

### 获取系统配置

```http
GET /api/config
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "checkInterval": 60,
    "alertThreshold": 30,
    "alertThresholdPercent": 0.7,
    "notifyChannel": "feishu",
    "dataSource": "Kitco",
    "timezone": "UTC",
    "maxHistoryDays": 30,
    "webPort": 3000
  }
}
```

---

## 🔒 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "value",
      "issue": "must be greater than 0"
    }
  }
}
```

### 常见错误码
| 错误码 | HTTP 状态码 | 描述 |
|--------|-------------|------|
| `VALIDATION_ERROR` | 400 | 输入数据验证失败 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `RATE_LIMIT` | 429 | 请求频率超限 |

---

## 🚀 集成示例

### JavaScript/Node.js
```javascript
// 获取当前金价
async function getCurrentPrice() {
  try {
    const response = await fetch('http://localhost:3000/api/price');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('获取金价失败:', error);
  }
}

// 创建价格预警
async function createAlert(threshold, direction) {
  const response = await fetch('http://localhost:3000/api/alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'threshold',
      direction: direction,
      value: threshold,
      notificationChannel: 'webhook'
    })
  });
  
  return await response.json();
}
```

### Python
```python
import requests
import json

# 获取当前金价
def get_current_price():
    try:
        response = requests.get('http://localhost:3000/api/price')
        data = response.json()
        return data['data']
    except Exception as e:
        print(f"获取金价失败: {e}")

# 创建价格预警
def create_alert(threshold, direction):
    alert_data = {
        'type': 'threshold',
        'direction': direction,
        'value': threshold,
        'notificationChannel': 'webhook'
    }
    
    response = requests.post(
        'http://localhost:3000/api/alerts',
        json=alert_data,
        headers={'Content-Type': 'application/json'}
    )
    
    return response.json()
```

### cURL
```bash
# 获取当前金价
curl -X GET http://localhost:3000/api/price

# 创建价格预警
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threshold",
    "direction": "above",
    "value": 3150,
    "notificationChannel": "feishu"
  }'

# 获取历史数据
curl -X GET "http://localhost:3000/api/history?days=7&limit=50"
```

---

## 📝 Webhook 通知格式

当预警触发时，系统会向配置的 Webhook URL 发送 POST 请求：

```json
{
  "event": "price_alert_triggered",
  "timestamp": "2026-04-01T13:45:00Z",
  "alert": {
    "id": "alert_001",
    "type": "threshold",
    "direction": "above",
    "value": 3150,
    "triggered": true
  },
  "price": {
    "current": 3155.00,
    "previous": 3022.50,
    "change": 132.50,
    "changePercent": 4.38
  },
  "notification": {
    "channel": "webhook",
    "delivered": true
  }
}
```

---

## 🛠️ API 使用最佳实践

1. **错误处理**: 始终检查响应状态码和错误信息
2. **重试机制**: 网络请求失败时实现指数退避重试
3. **缓存策略**: 对于价格数据可以实现短期缓存
4. **请求频率**: 遵守 API 速率限制
5. **数据验证**: 验证输入数据的有效性
6. **安全**: 生产环境建议添加 API Key 认证

---

## 📞 技术支持

如果在使用 API 过程中遇到问题：

1. 查看 [GitHub Issues](https://github.com/HoneyKarina/gold-alert/issues)
2. 阅读 [完整文档](README.md)
3. 提交 [Feature Request](https://github.com/HoneyKarina/gold-alert/issues/new)

---

*API 文档版本：v1.0*  
*最后更新：2026-04-01*