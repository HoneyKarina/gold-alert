/**
 * HTTP 服务器 - 增强版
 * 提供 REST API、Web 界面、认证、监控和性能分析
 */

import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { PriceStore } from './price-store.js';
import { AlertEngine } from './alert-engine-enhanced.js';
import { fetchGoldPrice } from './price-fetcher-enhanced.js';

interface ServerConfig {
  port: number;
  host: string;
  ssl?: {
    key: string;
    cert: string;
  };
  apiKeys: string[];
  rateLimit: number;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    timestamp: string;
    version: string;
    responseTime: number;
  };
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(ip: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(ip) || [];

    // 清理过期的请求记录
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(ip, validRequests);
    return true;
  }

  getRemaining(ip: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(ip) || [];
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

class APIServer {
  private store: PriceStore;
  private alertEngine: AlertEngine;
  private config: ServerConfig;
  private server: http.Server | https.Server;
  private rateLimiter: RateLimiter;
  private startTime: Date;

  constructor(
    store: PriceStore,
    alertEngine: AlertEngine,
    config: Partial<ServerConfig> = {}
  ) {
    this.store = store;
    this.alertEngine = alertEngine;
    this.startTime = new Date();
    
    this.config = {
      port: 3000,
      host: 'localhost',
      apiKeys: [],
      rateLimit: 100,
      ...config
    };

    this.rateLimiter = new RateLimiter(this.config.rateLimit, 60000); // 每分钟100次请求
    this.server = this.createServer();
  }

  private createServer(): http.Server | https.Server {
    const requestHandler = this.handleRequest.bind(this);
    
    if (this.config.ssl) {
      return https.createServer({
        key: fs.readFileSync(this.config.ssl.key),
        cert: fs.readFileSync(this.config.ssl.cert),
      }, requestHandler);
    }

    return http.createServer(requestHandler);
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    const startTime = Date.now();
    const clientIP = req.socket.remoteAddress || 'unknown';
    
    try {
      // 设置CORS头
      this.setCORSHeaders(res);

      // 处理OPTIONS请求
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // 检查速率限制
      if (!this.rateLimiter.isAllowed(clientIP)) {
        this.sendError(res, 429, 'Rate limit exceeded', startTime);
        return;
      }

      // API认证检查
      if (req.url?.startsWith('/api/')) {
        if (!this.authenticate(req)) {
          this.sendError(res, 401, 'Unauthorized', startTime);
          return;
        }
      }

      // 解析请求
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const pathname = url.pathname;
      const method = req.method || 'GET';

      // API路由
      if (pathname.startsWith('/api/')) {
        await this.handleAPI(pathname, method, req, res, url);
        return;
      }

      // 静态文件服务
      await this.handleStaticFile(pathname, res, startTime);
      return;

    } catch (error) {
      console.error('Request error:', error);
      this.sendError(res, 500, 'Internal Server Error', startTime);
    } finally {
      const responseTime = Date.now() - startTime;
      console.log(`${method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
    }
  }

  private setCORSHeaders(res: http.ServerResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  private authenticate(req: http.IncomingMessage): boolean {
    const apiKey = req.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) return false;
    return this.config.apiKeys.includes(apiKey);
  }

  private async handleAPI(
    pathname: string,
    method: string,
    req: http.IncomingMessage,
    res: http.ServerResponse,
    url: URL
  ) {
    await this.store.load();

    try {
      switch (pathname) {
        case '/api/health':
          await this.handleHealthCheck(res);
          break;

        case '/api/price/current':
          await this.handleCurrentPrice(res);
          break;

        case '/api/price/history':
          await this.handlePriceHistory(res, url);
          break;

        case '/api/price/statistics':
          await this.handlePriceStatistics(res);
          break;

        case '/api/predict':
          await this.handlePrediction(res);
          break;

        case '/api/rules':
          await this.handleRules(res);
          break;

        case '/api/rules/add':
          if (method === 'POST') {
            await this.handleAddRule(req, res);
          } else {
            this.sendError(res, 405, 'Method not allowed');
          }
          break;

        case '/api/alerts':
          await this.handleAlerts(res);
          break;

        case '/api/statistics':
          await this.handleSystemStatistics(res);
          break;

        case '/api/logs':
          if (method === 'GET') {
            await this.handleLogs(req, res);
          } else {
            this.sendError(res, 405, 'Method not allowed');
          }
          break;

        default:
          this.sendError(res, 404, 'API endpoint not found');
      }
    } catch (error) {
      console.error('API error:', error);
      this.sendError(res, 500, 'API Error');
    }
  }

  private async handleHealthCheck(res: http.ServerResponse) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime.getTime(),
      database: 'connected',
      services: {
        priceFetcher: 'operational',
        alertEngine: 'operational'
      }
    };

    this.sendResponse(res, 200, health);
  }

  private async handleCurrentPrice(res: http.ServerResponse) {
    try {
      const price = await fetchGoldPrice();
      this.sendResponse(res, 200, price);
    } catch (error) {
      const latest = await this.store.getLastPrice();
      if (latest) {
        this.sendResponse(res, 200, latest);
      } else {
        this.sendError(res, 404, 'No price data available');
      }
    }
  }

  private async handlePriceHistory(res: http.ServerResponse, url: URL) {
    const days = parseInt(url.searchParams.get('days') || '7');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000);
    
    const history = await this.store.getPriceHistory(days, limit);
    this.sendResponse(res, 200, history);
  }

  private async handlePriceStatistics(res: http.ServerResponse) {
    const stats = await this.store.getStatistics();
    this.sendResponse(res, 200, stats);
  }

  private async handlePrediction(res: http.ServerResponse) {
    const prediction = this.alertEngine.getPredictiveAnalysis();
    this.sendResponse(res, 200, prediction);
  }

  private async handleRules(res: http.ServerResponse) {
    const rules = this.alertEngine.getRules();
    this.sendResponse(res, 200, rules);
  }

  private async handleAddRule(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      const body = await this.readRequestBody(req);
      const rule = JSON.parse(body);
      
      // 验证规则
      if (!rule.id || !rule.name || !rule.type) {
        this.sendError(res, 400, 'Invalid rule format');
        return;
      }

      this.alertEngine.addRule(rule);
      this.sendResponse(res, 201, { message: 'Rule added successfully' });
    } catch (error) {
      this.sendError(res, 400, 'Invalid request body');
    }
  }

  private async handleAlerts(res: http.ServerResponse) {
    // 这里可以实现获取历史预警的功能
    const alerts = {
      total: 0,
      recent: [],
      byType: {}
    };
    this.sendResponse(res, 200, alerts);
  }

  private async handleSystemStatistics(res: http.ServerResponse) {
    const uptime = Date.now() - this.startTime.getTime();
    const memoryUsage = process.memoryUsage();
    
    const stats = {
      uptime,
      memory: {
        used: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      rateLimit: {
        maxRequests: this.config.rateLimit,
        remaining: this.rateLimiter.getRemaining('unknown'),
      }
    };

    this.sendResponse(res, 200, stats);
  }

  private async handleLogs(req: http.IncomingMessage, res: http.ServerResponse) {
    const level = req.url?.includes('level=') ? 
      req.url.split('level=')[1] : 'all';
    const limit = parseInt(req.url?.includes('limit=') ? 
      req.url.split('limit=')[1] : '100');

    // 这里应该实现日志查询功能
    const logs = {
      level,
      limit,
      logs: []
    };

    this.sendResponse(res, 200, logs);
  }

  private async handleStaticFile(pathname: string, res: http.ServerResponse, startTime: number) {
    try {
      const publicPath = path.join(process.cwd(), 'public');
      const filePath = path.join(publicPath, pathname === '/' ? 'index.html' : pathname);
      
      // 检查文件是否存在
      await fs.promises.access(filePath, fs.constants.R_OK);
      
      // 获取文件扩展名
      const ext = path.extname(filePath);
      const contentType = this.getContentType(ext);
      
      const content = await fs.promises.readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      
    } catch (error) {
      // 文件不存在，返回404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }

  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
    };
    return types[ext] || 'application/octet-stream';
  }

  private async readRequestBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
      req.on('error', (error) => {
        reject(error);
      });
    });
  }

  private sendResponse(res: http.ServerResponse, statusCode: number, data: any) {
    const response: APIResponse = {
      success: statusCode < 400,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        responseTime: Date.now() - (res as any).startTime || 0,
      }
    };

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  }

  private sendError(res: http.ServerResponse, statusCode: number, message: string, startTime?: number) {
    const response: APIResponse = {
      success: false,
      error: message,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        responseTime: startTime ? Date.now() - startTime : 0,
      }
    };

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`🌐 Enhanced API server started at http://${this.config.host}:${this.config.port}`);
        console.log(`📊 Health check: http://${this.config.host}:${this.config.port}/api/health`);
        console.log(`🔒 API endpoints: http://${this.config.host}:${this.config.port}/api/*`);
        console.log(`🚀 Rate limit: ${this.config.rateLimit} requests/minute`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('✅ Server stopped');
        resolve();
      });
    });
  }
}

export function createServer(store: PriceStore, alertEngine: AlertEngine): APIServer {
  const apiKeys = process.env.API_KEY ? [process.env.API_KEY] : [];
  const port = parseInt(process.env.PORT || '3000');
  const host = process.env.HOST || 'localhost';

  return new APIServer(store, alertEngine, {
    port,
    host,
    apiKeys,
    rateLimit: parseInt(process.env.RATE_LIMIT || '100'),
  });
}