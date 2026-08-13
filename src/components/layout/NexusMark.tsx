import type { SVGProps } from "react";

/**
 * Abstract geometric mark: a central hub connected to three nodes.
 * Deliberately not an AI-sparkle icon — reads as "connection point / network".
 */
export function NexusMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 12L12 3.5M12 12L4.5 17M12 12L19.5 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="3.5" r="1.9" fill="currentColor" fillOpacity="0.55" />
      <circle cx="4.5" cy="17" r="1.9" fill="currentColor" fillOpacity="0.55" />
      <circle cx="19.5" cy="17" r="1.9" fill="currentColor" fillOpacity="0.55" />
      <circle cx="12" cy="12" r="2.9" fill="currentColor" />
    </svg>
  );
}
