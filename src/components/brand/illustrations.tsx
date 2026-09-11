import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Monoline illustration family. One stroke weight, rounded caps, minimal detail,
 * ink/blue base with a single yellow highlight. Only the primitives M1 needs.
 */
type IllustrationProps = SVGProps<SVGSVGElement> & { className?: string };

function Frame({ className, children, ...rest }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="var(--illustration-stroke)"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-12 text-primary", className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function DocumentsIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="12" y="8" width="24" height="32" rx="3" />
      <circle cx="24" cy="19" r="4" />
      <path d="M17 30h14M17 35h9" />
      <path d="M31 35h4" className="text-accent" stroke="currentColor" />
    </Frame>
  );
}

export function BorderIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M10 38V10" />
      <path d="M38 38V10" />
      <path d="M10 20h28" />
      <path d="M18 30h12" className="text-accent" stroke="currentColor" />
      <circle cx="24" cy="30" r="1.6" fill="currentColor" stroke="none" />
    </Frame>
  );
}

export function BaggageIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="11" y="16" width="26" height="22" rx="3" />
      <path d="M19 16v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      <path d="M24 22v10" className="text-accent" stroke="currentColor" />
    </Frame>
  );
}

export function ParcelIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M24 10l12 6v14l-12 6-12-6V16z" />
      <path d="M12 16l12 6 12-6M24 22v14" />
      <path d="M8 42h32" className="text-accent" stroke="currentColor" />
    </Frame>
  );
}

export function PhoneIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="16" y="7" width="16" height="34" rx="4" />
      <path d="M21 12h6" />
      <circle cx="24" cy="35" r="1.6" fill="currentColor" stroke="none" />
    </Frame>
  );
}

export function RouteIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="12" cy="34" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="36" cy="14" r="3.5" />
      <path d="M15 32c6 0 10-4 10-9s4-8 8-8" strokeDasharray="1 5" />
    </Frame>
  );
}

export function DestinationIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M24 41s11-11 11-19a11 11 0 1 0-22 0c0 8 11 19 11 19z" />
      <circle cx="24" cy="21" r="3.5" className="text-accent" stroke="currentColor" />
    </Frame>
  );
}

export function InformationIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="24" cy="24" r="15" />
      <path d="M24 22v10" />
      <circle cx="24" cy="17" r="1.6" fill="currentColor" stroke="none" className="text-accent" />
    </Frame>
  );
}

export const illustrations = {
  documents: DocumentsIllustration,
  border: BorderIllustration,
  baggage: BaggageIllustration,
  parcel: ParcelIllustration,
  phone: PhoneIllustration,
  route: RouteIllustration,
  destination: DestinationIllustration,
  information: InformationIllustration,
} as const;

export type IllustrationName = keyof typeof illustrations;
