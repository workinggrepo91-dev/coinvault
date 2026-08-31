export interface CoinPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const DEFAULT_COINS: CoinPriceData[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    current_price: 66420.50,
    price_change_percentage_24h: 2.35,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    current_price: 3450.25,
    price_change_percentage_24h: 1.82,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    current_price: 1.0,
    price_change_percentage_24h: 0.01,
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    current_price: 154.75,
    price_change_percentage_24h: 4.12,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    current_price: 585.30,
    price_change_percentage_24h: -0.45,
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  },
  {
    id: "ripple",
    symbol: "xrp",
    name: "XRP",
    current_price: 0.58,
    price_change_percentage_24h: 1.15,
    image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  },
  {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    current_price: 0.42,
    price_change_percentage_24h: -1.20,
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  },
  {
    id: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    current_price: 0.125,
    price_change_percentage_24h: 3.45,
    image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
  },
  {
    id: "avalanche-2",
    symbol: "avax",
    name: "Avalanche",
    current_price: 28.60,
    price_change_percentage_24h: 2.10,
    image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
  },
  {
    id: "polkadot",
    symbol: "dot",
    name: "Polkadot",
    current_price: 5.20,
    price_change_percentage_24h: -0.85,
    image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
  },
  {
    id: "chainlink",
    symbol: "link",
    name: "Chainlink",
    current_price: 14.30,
    price_change_percentage_24h: 1.95,
    image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
  },
  {
    id: "litecoin",
    symbol: "ltc",
    name: "Litecoin",
    current_price: 74.50,
    price_change_percentage_24h: 0.65,
    image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
  },
  {
    id: "near",
    symbol: "near",
    name: "NEAR Protocol",
    current_price: 5.10,
    price_change_percentage_24h: 3.80,
    image: "https://assets.coingecko.com/coins/images/10365/large/near.png",
  },
  {
    id: "polygon-ecosystem-token",
    symbol: "pol",
    name: "Polygon",
    current_price: 0.44,
    price_change_percentage_24h: 1.10,
    image: "https://assets.coingecko.com/coins/images/4713/large/polygon.png",
  },
];

let cache: { data: CoinPriceData[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 6000; // 6 seconds server-side memory cache

export async function fetchLiveMarketPrices(): Promise<CoinPriceData[]> {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  // Multi-tier live fetching strategy
  // 1. Try Binance public 24hr API (Extremely fast, reliable, zero key needed)
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
      cache: "no-store",
      headers: { "User-Agent": "CoinVault/1.0" },
    });

    if (res.ok) {
      const tickers: Array<{ symbol: string; lastPrice: string; priceChangePercent: string }> = await res.json();
      const tickerMap = new Map<string, { price: number; change: number }>();

      for (const t of tickers) {
        if (t.symbol.endsWith("USDT")) {
          const sym = t.symbol.replace("USDT", "").toLowerCase();
          tickerMap.set(sym, {
            price: parseFloat(t.lastPrice) || 0,
            change: parseFloat(t.priceChangePercent) || 0,
          });
        }
      }

      const updatedCoins = DEFAULT_COINS.map((coin) => {
        const live = tickerMap.get(coin.symbol.toLowerCase());
        if (live && live.price > 0) {
          return {
            ...coin,
            current_price: live.price,
            price_change_percentage_24h: live.change,
          };
        }
        return coin;
      });

      cache = { data: updatedCoins, timestamp: now };
      return updatedCoins;
    }
  } catch (binanceErr) {
    console.warn("Binance price fetch fallback triggered:", (binanceErr as any)?.message);
  }

  // 2. Try CoinGecko Markets API
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mappedCoins: CoinPriceData[] = data.map((c: any) => ({
          id: c.id,
          symbol: c.symbol?.toLowerCase() || "",
          name: c.name,
          current_price: c.current_price || 0,
          price_change_percentage_24h: c.price_change_percentage_24h || 0,
          image: c.image || "",
        }));

        cache = { data: mappedCoins, timestamp: now };
        return mappedCoins;
      }
    }
  } catch (cgErr) {
    console.warn("CoinGecko price fetch fallback triggered:", (cgErr as any)?.message);
  }

  // 3. Fallback to default realistic baseline
  if (cache) {
    return cache.data;
  }
  return DEFAULT_COINS;
}
