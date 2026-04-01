/**
 * HTTP 服务器
 * 提供 REST API 和 Web 界面
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { PriceStore } from './price-store.js';

const store = new PriceStore();
const PORT = process.env.PORT || 3000;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const url = req.url || '/';
  const method = req.method || 'GET';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // API 路由
    if (url.startsWith('/api/')) {
      await handleAPI(url, method, req, res);
      return;
    }

    // 静态文件
    if (url === '/') {
      const htmlPath = path.join(process.cwd(), 'web/index.html');
      const html = await fs.promises.readFile(htmlPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
}

async function handleAPI(
  url: string,
  method: string,
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  await store.load();

  if (url === '/api/price' && method === 'GET') {
    const latest = await store.getLastPrice();
    if (!latest) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'No price data available' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(latest));
    return;
  }

  if (url.startsWith('/api/history') && method === 'GET') {
    const days = parseInt(new URL(url, `http://${req.headers.host}`).searchParams.get('days') || '7');
    const history = await store.getPriceHistory(days);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(history));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'API not found' }));
}

export function startServer() {
  const server = http.createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(`🌐 Web server running at http://localhost:${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api/price`);
  });

  return server;
}
