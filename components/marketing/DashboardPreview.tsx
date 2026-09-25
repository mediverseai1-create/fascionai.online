import { Tag } from "@/components/ui/Tag";

const ATTENTION_ROWS: {
  name: string;
  meta: string;
  tag: string;
  variant: "good" | "risk" | "watch";
}[] = [
  {
    name: "Kira Wrap Dress",
    meta: "Terracotta · UK 10–14",
    tag: "Stockout in 6 days",
    variant: "risk",
  },
  {
    name: "Oslo Wool Coat",
    meta: "Charcoal · All sizes",
    tag: "Reorder window closing",
    variant: "watch",
  },
  {
    name: "Reyna Silk Blouse",
    meta: "Ivory · UK 6–8",
    tag: "Overstock, 118 units",
    variant: "risk",
  },
  {
    name: "Petra Denim Jacket",
    meta: "Mid-wash · UK 12",
    tag: "Trending +34% WoW",
    variant: "good",
  },
  {
    name: "Milo Knit Vest",
    meta: "Sage · UK 8–10",
    tag: "Size curve imbalance",
    variant: "watch",
  },
];

const BAR_HEIGHTS = [38, 52, 44, 61, 70, 66, 88];
const BAR_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"];

/** Illustrative dashboard mockup — sample data only, not a live view. */
export function DashboardPreview() {
  return (
    <div className="bg-card border border-line rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-line bg-[#FBFAF7]">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-line" />
          <span className="w-2 h-2 rounded-full bg-line" />
          <span className="w-2 h-2 rounded-full bg-line" />
        </div>
        <span className="font-mono text-xs text-muted">
          fascionai.online/dashboard · Example workspace
        </span>
        <span className="font-mono text-xs text-muted">Sample data</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[12.5px] font-mono uppercase tracking-[0.06em] text-muted">
              Attention needed
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-brass bg-brass-soft px-1.5 py-0.5 rounded-[2px]">
              AI-flagged
            </span>
          </div>
          {ATTENTION_ROWS.map((row, i) => (
            <div
              key={row.name}
              className={`flex items-center justify-between py-2.5 ${
                i !== ATTENTION_ROWS.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div className="text-sm">
                {row.name}
                <small className="block text-muted text-xs font-mono mt-0.5">{row.meta}</small>
              </div>
              <Tag variant={row.variant}>{row.tag}</Tag>
            </div>
          ))}
        </div>
        <div className="p-6 border-t md:border-t-0 md:border-l border-line">
          <div className="text-[12.5px] font-mono uppercase tracking-[0.06em] text-muted mb-4">
            Sell-through — Kira Wrap Dress
          </div>
          <div className="flex items-end gap-1.5 h-[120px] mt-1.5">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-[1px] ${
                  i === BAR_HEIGHTS.length - 1 ? "bg-wine" : "bg-brass-soft"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex gap-1.5 mt-2">
            {BAR_LABELS.map((label) => (
              <span key={label} className="flex-1 text-center font-mono text-[10px] text-muted">
                {label}
              </span>
            ))}
          </div>
          <div className="flex justify-between font-mono text-[13px] text-ink mt-5 pt-3.5 border-t border-line">
            <span>AI-projected stockout</span>
            <b className="text-risk">6 days</b>
          </div>
          <div className="flex justify-between font-mono text-[13px] text-ink mt-4 pt-3.5 border-t border-line">
            <span>AI-recommended reorder</span>
            <b className="text-good">+240 units</b>
          </div>
        </div>
      </div>
    </div>
  );
}
