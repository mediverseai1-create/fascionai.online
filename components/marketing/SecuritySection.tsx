import { Eyebrow } from "@/components/ui/Eyebrow";

const CARDS = [
  {
    title: "Encrypted in transit & at rest",
    desc: "Every upload and every stored record is encrypted, so your sales and inventory numbers stay private end to end.",
  },
  {
    title: "You own your data",
    desc: "Export everything you've uploaded at any time, or permanently delete your workspace with one request.",
  },
  {
    title: "Role-based access",
    desc: "Give buyers, planners, and finance exactly the visibility they need, and nothing more, from day one.",
  },
  {
    title: "No data sharing",
    desc: "Your catalogue and sales history are never sold, shared, or used to train models for other companies.",
  },
  {
    title: "CSV in, CSV out",
    desc: "No lock-in. Bring your data in from any POS or e-commerce export, and take it with you the same way.",
  },
  {
    title: "Built to scale up",
    desc: "Single sign-on, audit logs, and formal compliance certifications are on our roadmap as we grow with larger teams.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="bg-ink text-white py-16 sm:py-24">
      <div className="wrap">
        <div className="max-w-[620px] mb-[52px]">
          <Eyebrow onDark className="[border-left-color:var(--brass)]">
            Security &amp; data
          </Eyebrow>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.18] text-white">
            Your sales and inventory data stays yours.
          </h2>
          <p className="mt-3.5 text-base text-white/60 leading-[1.6]">
            Facsion AI is built to hold sensitive commercial data responsibly, from the first
            upload.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px] mt-2.5">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="border border-white/14 rounded-[var(--radius)] p-[22px]"
            >
              <h4 className="text-[15.5px] font-semibold text-white mb-1.5">{card.title}</h4>
              <p className="text-[13.5px] text-white/60 leading-[1.5]">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
