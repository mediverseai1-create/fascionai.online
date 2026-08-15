import Link from "next/link";

export function Logo({ small = false }: { small?: boolean }) {
  const size = small ? 26 : 30;
  return (
    <Link href="#top" className="flex items-center gap-2.5" aria-label="Facsion AI home">
      <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
        <rect x="2" y="16" width="5" height="12" fill="#5C1A34" />
        <rect x="9" y="9" width="5" height="19" fill="#A9824C" />
        <rect x="16" y="3" width="5" height="25" fill="#5C1A34" />
        <rect x="23" y="12" width="5" height="16" fill="#A9824C" />
      </svg>
      <span className="font-serif text-xl font-semibold tracking-[-0.01em]">
        Facsion<span className="text-brass"> AI</span>
      </span>
    </Link>
  );
}
