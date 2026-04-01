/**
 * 价格存储模块
 * 使用 JSON 文件存储历史价格数据
 */

import { GoldPrice } from './price-fetcher.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRICE_FILE = path.join(DATA_DIR, 'prices.json');

export interface PriceRecord extends GoldPrice {
  id: string;
}

export class PriceStore {
  private prices: PriceRecord[] = [];
  private loaded = false;

  async load() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const data = await fs.readFile(PRICE_FILE, 'utf-8');
      this.prices = JSON.parse(data);
      this.loaded = true;
    } catch (error) {
      // 文件不存在，初始化空数组
      this.prices = [];
      this.loaded = true;
    }
  }

  async save() {
    if (!this.loaded) await this.load();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(PRICE_FILE, JSON.stringify(this.prices, null, 2));
  }

  async addPrice(price: GoldPrice): Promise<PriceRecord> {
    if (!this.loaded) await this.load();

    const record: PriceRecord = {
      ...price,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.prices.push(record);

    // 只保留最近 30 天的数据（每小时一条 = 720 条）
    if (this.prices.length > 720) {
      this.prices = this.prices.slice(-720);
    }

    await this.save();
    return record;
  }

  async getLatestPrices(count: number = 24): Promise<PriceRecord[]> {
    if (!this.loaded) await this.load();
    return this.prices.slice(-count);
  }

  async getPriceHistory(days: number = 7): Promise<PriceRecord[]> {
    if (!this.loaded) await this.load();

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.prices.filter(p => new Date(p.timestamp).getTime() > cutoff);
  }

  async getLastPrice(): Promise<PriceRecord | null> {
    if (!this.loaded) await this.load();
    return this.prices[this.prices.length - 1] || null;
  }
}
