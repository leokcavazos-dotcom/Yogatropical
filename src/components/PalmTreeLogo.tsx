interface PalmTreeLogoProps {
  className?: string;
}

// A single stylized palm tree, kept simple enough to read clearly at small
// (nav bar) sizes while still feeling warm and tropical.
export default function PalmTreeLogo({ className }: PalmTreeLogoProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M24 44V22"
        stroke="var(--color-clay-dark)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 26c-3-4-2-8 1-11"
        stroke="var(--color-clay-dark)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g fill="var(--color-palm)">
        <path d="M25 15c-6-4-13-3-17 1 6 3 13 2 17-1Z" />
        <path d="M25 15c-2-7-8-11-14-11 1 7 6 11 14 11Z" />
        <path d="M25 15c6-4 13-3 17 1-6 3-13 2-17-1Z" />
        <path d="M25 15c2-7 8-11 14-11-1 7-6 11-14 11Z" />
        <path d="M25 15c-1-7 2-13 7-16-3 6-4 12-7 16Z" />
      </g>
      <ellipse cx="25" cy="44" rx="10" ry="2.5" fill="var(--color-sand)" />
    </svg>
  );
}
