/**
 * 金价获取模块 - 增强版
 * 支持多数据源、重试机制、错误恢复和缓存
 */

export interface GoldPrice {
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  source: string;
  confidence: number; // 数据质量置信度 0-1
}

export interface PriceDataSource {
  name: string;
  url: string;
  parser: (html: string) => GoldPrice;
  timeout: number;
}

// 金价数据解析器
const priceParsers = {
  // Kitco 解析器
  kitco: (html: string): GoldPrice => {
    try {
      // 尝试从 JSON 数据中提取
      const jsonMatch = html.match(/"symbol":"AU"[^}]*"mid":(\d+\.?\d*)/);
      const changeMatch = html.match(/"symbol":"AU"[^}]*"change":(-?\d+\.?\d*)/);
      const percentMatch = html.match(/"symbol":"AU"[^}]*"changePercentage":(-?\d+\.?\d*)/);

      if (!jsonMatch) {
        throw new Error('Kitco JSON数据解析失败');
      }

      return {
        price: parseFloat(jsonMatch[1]),
        change: parseFloat(changeMatch?.[1] || '0'),
        changePercent: parseFloat(percentMatch?.[1] || '0'),
        timestamp: new Date(),
        source: 'Kitco',
        confidence: 0.9,
      };
    } catch (error) {
      throw new Error(`Kitco解析失败: ${error}`);
    }
  },

  // GoldPrice.org 解析器
  goldpriceOrg: (html: string): GoldPrice => {
    try {
      // 从表格中提取金价
      const priceMatch = html.match(/<td[^>]*>\s*\$?(\d+\.?\d*)\s*<\/td>/);
      if (!priceMatch) {
        throw new Error('GoldPrice.org价格解析失败');
      }

      // 假设变化率为0（需要更复杂的解析）
      const price = parseFloat(priceMatch[1]);
      
      return {
        price,
        change: 0,
        changePercent: 0,
        timestamp: new Date(),
        source: 'GoldPrice.org',
        confidence: 0.7,
      };
    } catch (error) {
      throw new Error(`GoldPrice.org解析失败: ${error}`);
    }
  },

  // TradingView 解析器
  tradingView: (html: string): GoldPrice => {
    try {
      const priceMatch = html.match(/"last_price":"(\d+\.?\d*)"/);
      if (!priceMatch) {
        throw new Error('TradingView价格解析失败');
      }

      const price = parseFloat(priceMatch[1]);
      
      return {
        price,
        change: 0,
        changePercent: 0,
        timestamp: new Date(),
        source: 'TradingView',
        confidence: 0.8,
      };
    } catch (error) {
      throw new Error(`TradingView解析失败: ${error}`);
    }
  },
};

// 数据源配置
const dataSources: PriceDataSource[] = [
  {
    name: 'Kitco',
    url: 'https://www.kitco.com/price/precious-metals/gold',
    parser: priceParsers.kitco,
    timeout: 10000,
  },
  {
    name: 'GoldPrice.org',
    url: 'https://www.goldprice.org/gold-price-per-gram.html',
    parser: priceParsers.goldpriceOrg,
    timeout: 8000,
  },
  {
    name: 'TradingView',
    url: 'https://www.tradingview.com/symbols/XAUUSD/',
    parser: priceParsers.tradingView,
    timeout: 8000,
  },
];

// 缓存机制
class PriceCache {
  private cache: GoldPrice[] = [];
  private maxSize = 100;
  private expireTime = 5 * 60 * 1000; // 5分钟缓存

  add(price: GoldPrice) {
    this.cache.unshift(price);
    if (this.cache.length > this.maxSize) {
      this.cache.pop();
    }
  }

  getLatest(): GoldPrice | null {
    if (this.cache.length === 0) return null;
    
    const latest = this.cache[0];
    const age = Date.now() - latest.timestamp.getTime();
    
    if (age > this.expireTime) {
      return null;
    }
    
    return latest;
  }

  getAll(): GoldPrice[] {
    return this.cache;
  }
}

const priceCache = new PriceCache();

export async function fetchGoldPrice(): Promise<GoldPrice> {
  // 先检查缓存
  const cached = priceCache.getLatest();
  if (cached) {
    console.log(`🎯 使用缓存金价: $${cached.price.toFixed(2)} (来源: ${cached.source})`);
    return cached;
  }

  const errors: string[] = [];
  
  // 尝试所有数据源
  for (const source of dataSources) {
    try {
      console.log(`🔄 正在尝试数据源: ${source.name}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), source.timeout);
      
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const price = source.parser(html);
      
      // 添加到缓存
      priceCache.add(price);
      
      console.log(`✅ 成功获取金价: $${price.price.toFixed(2)} (来源: ${price.source}, 置信度: ${price.confidence})`);
      return price;
      
    } catch (error) {
      const errorMessage = `${source.name}: ${error}`;
      errors.push(errorMessage);
      console.error(`❌ 数据源失败: ${errorMessage}`);
      
      // 延迟后重试下一个数据源
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error(`所有数据源都失败了:\n${errors.join('\n')}`);
}

/**
 * 获取多个数据源的金价，返回最佳结果
 */
export async function fetchGoldPriceMultiSource(): Promise<GoldPrice> {
  const results: GoldPrice[] = [];
  const errors: string[] = [];

  // 并发请求多个数据源
  const promises = dataSources.map(async (source) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), source.timeout);
      
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const price = source.parser(html);
      results.push(price);
      
    } catch (error) {
      errors.push(`${source.name}: ${error}`);
    }
  });

  await Promise.allSettled(promises);

  // 选择置信度最高的结果
  if (results.length > 0) {
    const bestResult = results.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
    
    console.log(`🎯 选择最佳数据源: ${bestResult.source} (置信度: ${bestResult.confidence})`);
    priceCache.add(bestResult);
    return bestResult;
  }

  throw new Error(`所有数据源都失败了:\n${errors.join('\n')}`);
}

/**
 * 获取历史金价数据（模拟）
 */
export async function fetchHistoricalPrices(days: number = 7): Promise<GoldPrice[]> {
  // 这里可以集成真实的历史数据API
  const prices: GoldPrice[] = [];
  const basePrice = 2000; // 基准价格
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const change = Math.random() * 100 - 50; // -50 到 +50 的随机变化
    const price = basePrice + change;
    
    prices.push({
      price,
      change: i === 0 ? 0 : Math.random() * 20 - 10,
      changePercent: i === 0 ? 0 : Math.random() * 5 - 2.5,
      timestamp: date,
      source: 'Historical',
      confidence: 0.9,
    });
  }
  
  return prices.reverse();
}

/**
 * 清除缓存
 */
export function clearCache() {
  priceCache.clear();
  console.log('🗑️ 价格缓存已清除');
}

// 定期清理缓存
setInterval(() => {
  priceCache.clear();
}, 10 * 60 * 1000); // 每10分钟清理一次缓存