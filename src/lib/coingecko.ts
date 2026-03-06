export async function getLivePrices() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    return await res.json();
  } catch (error) {
    console.error("Price fetch failed:", error);
    return null;
  }
}