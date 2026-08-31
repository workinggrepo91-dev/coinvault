import { NextResponse } from "next/server";
import { fetchLiveMarketPrices } from "@/lib/prices";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coins = await fetchLiveMarketPrices();
    return NextResponse.json({
      success: true,
      coins,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
