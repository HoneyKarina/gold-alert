/**
 * 金价获取模块
 * 从 Kitco 获取实时金价数据
 */

export interface GoldPrice {
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  source: string;
}

export async function fetchGoldPrice(): Promise<GoldPrice> {
  try {
    const response = await fetch('https://www.kitco.com/price/precious-metals/gold', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = await response.text();

    // 从 HTML 中提取金价数据
    const priceMatch = html.match(/"symbol":"AU"[^}]*"mid":(\d+\.?\d*)/);
    const changeMatch = html.match(/"symbol":"AU"[^}]*"change":(-?\d+\.?\d*)/);
    const percentMatch = html.match(/"symbol":"AU"[^}]*"changePercentage":(-?\d+\.?\d*)/);

    if (!priceMatch) {
      throw new Error('无法从页面提取金价数据');
    }

    return {
      price: parseFloat(priceMatch[1]),
      change: parseFloat(changeMatch?.[1] || '0'),
      changePercent: parseFloat(percentMatch?.[1] || '0'),
      timestamp: new Date(),
      source: 'Kitco',
    };
  } catch (error) {
    throw new Error(`获取金价失败: ${error}`);
  }
}

/**
 * 获取多个数据源的金价（备用方案）
 */
export async function fetchGoldPriceMultiSource(): Promise<GoldPrice> {
  const sources = [
    fetchGoldPrice,
    // 可以添加更多数据源
  ];

  for (const fetcher of sources) {
    try {
      return await fetcher();
    } catch (error) {
      console.error(`数据源失败: ${error}`);
      continue;
    }
  }

  throw new Error('所有数据源都失败了');
}
