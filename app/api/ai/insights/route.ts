import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  getProducts,
  getSales,
  getLatestInventorySnapshots,
} from "@/lib/data/inventory";
import {
  rankProductsByRevenue,
  findOpportunities,
  getLatestInventoryByProduct,
  calculateAvgDailySalesRate,
  calculateDaysOfStock,
  isStockoutRisk,
  isOverstock,
  addDays,
} from "@/lib/analytics";

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { available: false, message: "AI insights are coming soon." },
      { status: 200 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 });
  }

  const organizationId = membership.organization_id;
  const { data: org } = await supabase
    .from("organizations")
    .select("name, currency")
    .eq("id", organizationId)
    .maybeSingle();

  if (!org) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 });
  }

  const [products, sales, snapshots] = await Promise.all([
    getProducts(organizationId),
    getSales(organizationId),
    getLatestInventorySnapshots(organizationId),
  ]);

  if (products.length === 0) {
    return NextResponse.json(
      { available: true, insight: null, message: "Not enough data yet — import sales and inventory data first." },
      { status: 200 }
    );
  }

  // Build the same computed-metrics summary the dashboard already shows —
  // the model only phrases numbers we've already calculated, it never
  // invents its own statistics.
  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);
  const recentSales = sales.filter((s) => new Date(s.sold_at) >= thirtyDaysAgo);
  const totalRevenue30d = recentSales.reduce((sum, s) => sum + s.revenue, 0);
  const topProducts = rankProductsByRevenue(products, sales, thirtyDaysAgo, now).slice(0, 5);

  const latestInventory = getLatestInventoryByProduct(snapshots);
  let stockoutRiskCount = 0;
  let overstockCount = 0;
  for (const product of products) {
    const snapshot = latestInventory.get(product.id);
    if (!snapshot) continue;
    const avgDailyRate = calculateAvgDailySalesRate(sales, product.id, 30, now);
    const daysOfStock = calculateDaysOfStock(snapshot.quantity_on_hand, avgDailyRate);
    if (isStockoutRisk(daysOfStock, snapshot.lead_time_days ?? 14)) stockoutRiskCount++;
    if (isOverstock(daysOfStock)) overstockCount++;
  }

  const opportunities = findOpportunities({ products, sales, snapshots, asOfDate: now }).slice(0, 8);

  const summary = {
    organization: org.name,
    currency: org.currency,
    revenueLast30Days: Math.round(totalRevenue30d * 100) / 100,
    topProducts: topProducts.map((p) => ({
      style: p.product.style_name,
      sku: p.product.sku,
      unitsSold: p.unitsSold,
      revenue: Math.round(p.revenue * 100) / 100,
    })),
    stockoutRiskCount,
    overstockCount,
    opportunities: opportunities.map((op) => ({ kind: op.kind, sku: op.product.sku, style: op.product.style_name })),
  };

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      system:
        "You are a fashion retail operations analyst. You are given a JSON summary of ALREADY-COMPUTED metrics from a retailer's real sales and inventory data. Write a short, plain-language briefing (3-5 sentences, no markdown headers) highlighting what matters most this week. Only reference numbers present in the JSON — never invent statistics, dates, or products not listed.",
      messages: [
        {
          role: "user",
          content: `Here is this week's data summary:\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const insight = textBlock && textBlock.type === "text" ? textBlock.text : null;

    return NextResponse.json({ available: true, insight });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI insight generation failed";
    return NextResponse.json({ available: true, insight: null, error: message }, { status: 200 });
  }
}
