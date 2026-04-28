import { NextResponse } from 'next/server';

let cache: { data: any; timestamp: number } | null = null;

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < 30000) {
      return NextResponse.json(cache.data);
    }

    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether-gold&vs_currencies=usd&include_24hr_change=true',
      { headers: { Accept: 'application/json' }, next: { revalidate: 30 } }
    );

    if (!res.ok) {
      return NextResponse.json({
        xauusd: { price: 2345.5, change24h: 0 },
        btcusd: { price: 67850, change24h: 0 },
        fallback: true,
      });
    }

    const data = await res.json();
    const gold = data['tether-gold'] || {};
    const btc = data['bitcoin'] || {};

    const result = {
      xauusd: { price: gold.usd || 2345.5, change24h: gold.usd_24h_change || 0 },
      btcusd: { price: btc.usd || 67850, change24h: btc.usd_24h_change || 0 },
    };

    cache = { data: result, timestamp: Date.now() };
    return NextResponse.json(result);
  } catch {
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({
      xauusd: { price: 2345.5, change24h: 0 },
      btcusd: { price: 67850, change24h: 0 },
      error: true,
    });
  }
}
