import { NextResponse, type NextRequest } from "next/server";
import { searchProducts } from "@/lib/shopify/queries";
import { isLocale } from "@/lib/i18n/config";

/** Live-search endpoint for the header search bar (read-only). */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const lang = request.nextUrl.searchParams.get("lang") ?? "en";

  if (q.length < 2) return NextResponse.json({ products: [] });

  try {
    const products = await searchProducts(q.slice(0, 80), isLocale(lang) ? lang : "en", 6);
    return NextResponse.json({ products }, { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch {
    return NextResponse.json({ products: [], error: true }, { status: 502 });
  }
}
