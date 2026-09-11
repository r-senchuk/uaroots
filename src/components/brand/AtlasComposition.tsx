import { countryCode } from "@/components/brand/RouteCapsule";
import { cn } from "@/lib/utils";

/**
 * The atlas plate: graticule, abstract European landmasses, a drawn corridor
 * between two waypoints, country abbreviations and editorial coordinates.
 * Decorative and deliberately schematic — it never claims real geometry.
 */
export function AtlasComposition({
  originLabel,
  destinationLabel,
  corridor,
  className,
  animate = true,
}: {
  originLabel: string;
  destinationLabel: string;
  corridor: string[];
  className?: string;
  animate?: boolean;
}) {
  const codes = corridor.map(countryCode);

  return (
    <div aria-hidden className={cn("relative select-none", className)}>
      <svg viewBox="0 0 520 560" className="h-auto w-full text-primary">
        {/* graticule */}
        <g opacity="var(--graticule-opacity)" stroke="currentColor" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line key={`v${i}`} x1={20 + i * 80} y1="10" x2={20 + i * 80} y2="550" />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line key={`h${i}`} x1="10" y1={30 + i * 85} x2="510" y2={30 + i * 85} />
          ))}
        </g>

        {/* abstract landmasses */}
        <g style={{ opacity: "var(--contour-opacity)" }} fill="currentColor">
          <path d="M60 470 L150 430 L230 452 L300 412 L372 438 L448 400 L470 458 L410 508 L318 522 L228 508 L140 528 Z" />
          <path d="M92 300 L168 258 L258 276 L332 236 L420 262 L452 320 L378 356 L286 344 L192 366 L118 350 Z" />
          <path d="M138 148 L216 108 L296 128 L370 96 L436 126 L444 182 L360 206 L270 194 L186 214 Z" />
        </g>
        <g fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" opacity="0.35">
          <path d="M60 470 L150 430 L230 452 L300 412 L372 438 L448 400" />
          <path d="M92 300 L168 258 L258 276 L332 236 L420 262" />
          <path d="M138 148 L216 108 L296 128 L370 96 L436 126" />
        </g>

        {/* corridor */}
        <path
          d="M96 486 C 150 380, 210 330, 268 268 S 372 150, 412 112"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray={animate ? 900 : undefined}
          className={animate ? "route-line-draw" : undefined}
        />

        {/* origin */}
        <circle cx="96" cy="486" r="6" fill="currentColor" />
        <circle
          cx="96"
          cy="486"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
        {/* waypoint */}
        <circle cx="268" cy="268" r="3.5" fill="currentColor" opacity="0.7" />
        {/* destination */}
        <circle cx="412" cy="112" r="7" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="412" cy="112" r="3" className="fill-accent" />
        <circle
          cx="412"
          cy="112"
          r="17"
          fill="none"
          className="stroke-accent"
          strokeWidth="1"
          opacity="0.55"
        />

        <g
          className="fill-foreground"
          style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em" }}
        >
          <text x="120" y="490">
            {originLabel.toUpperCase()}
          </text>
          <text x="436" y="116">
            {destinationLabel.toUpperCase()}
          </text>
        </g>
        <g
          className="fill-muted-foreground"
          style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.16em" }}
        >
          <text x="120" y="506">
            49.84 N / 24.03 E
          </text>
          <text x="290" y="262">
            {codes.join(" · ")}
          </text>
        </g>
      </svg>
    </div>
  );
}
