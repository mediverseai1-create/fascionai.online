const STATS = [
  {
    num: "21",
    sup: "%",
    text: "of fashion inventory value sits in slow-moving stock at any given time",
  },
  {
    num: "8.5",
    sup: "hrs",
    text: "spent weekly per planner reconciling sales sheets across sizes and colours",
  },
  {
    num: "1 in 6",
    sup: null,
    text: "bestsellers go out of stock before the season peak, without warning",
  },
  {
    num: "40",
    sup: "%",
    text: "average markdown taken on styles that were overproduced against demand",
  },
];

const CELL_BORDERS = [
  "border-line border-b sm:border-r md:border-b-0 md:border-r",
  "border-line border-b md:border-b-0 md:border-r",
  "border-line border-b sm:border-b-0 sm:border-r md:border-r",
  "border-line",
];

export function ProblemStats() {
  return (
    <div className="bg-card border-t border-b border-line">
      <div className="wrap">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div key={stat.num} className={`py-11 px-8 ${CELL_BORDERS[i]}`}>
              <div className="font-serif text-[38px] text-wine">
                {stat.num}
                {stat.sup && <sup className="text-[18px] relative top-[-14px]">{stat.sup}</sup>}
              </div>
              <div className="mt-2.5 text-sm text-muted leading-[1.5]">{stat.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
