import { Logo } from "./Logo";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "#product", label: "Dashboard" },
      { href: "#how", label: "How it works" },
      { href: "#security", label: "Security" },
      { href: "#pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Careers" },
      { href: "#", label: "Contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "#", label: "Help centre" },
      { href: "#", label: "API docs" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
      { href: "#", label: "Security" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="pt-16 pb-8">
      <div className="wrap">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(4,1fr)] gap-8">
          <div>
            <Logo small />
            <p className="mt-3.5 text-[13.5px] text-muted max-w-[220px] leading-[1.55]">
              Inventory intelligence for fashion retailers and brands. Know what to reorder, mark
              down, or move — before the season decides for you.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h5 className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted mb-3.5">
                {col.heading}
              </h5>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-ink mb-2.5 hover:text-wine"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-14 pt-6 border-t border-line text-[12.5px] text-muted flex-wrap gap-3">
          <span>&copy; 2026 Facsion AI. All rights reserved.</span>
          <span>Made for fashion retailers and brands.</span>
        </div>
      </div>
    </footer>
  );
}
