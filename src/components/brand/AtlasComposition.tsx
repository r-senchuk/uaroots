import { cn } from "@/lib/utils";

const DE_PATH =
  "M77.1 21.8 L89.9 23.8 L97 31.9 L112.6 31.9 L126.8 36 L132.5 31.9 L145.3 29.9 L151 38 L156.6 42 L159.5 54.1 L155.2 64.2 L162.3 70.3 L162.3 78.4 L163.7 90.5 L168 98.6 L162.3 102.6 L151 104.6 L138.2 112.7 L128.2 114.7 L132.5 124.8 L135.3 132.9 L142.4 139 L151 145 L146.7 151.1 L136.8 159.2 L139.6 169.3 L136.8 171.3 L116.9 173.3 L104.1 171.3 L99.8 175.3 L91.3 171.3 L77.1 167.3 L62.9 169.3 L62.9 159.2 L67.2 149.1 L71.4 141 L54.4 137 L48.7 130.9 L45.9 122.8 L43 114.7 L40.2 104.6 L43 92.5 L38.8 84.4 L50.1 82.4 L54.4 72.3 L57.2 54.1 L54.4 48.1 L65.8 46.1 L70 50.1 L75.7 50.1 L78.5 42 L81.4 36 L77.1 29.9 Z";

const PL_PATH =
  "M156.6 42 L168 38 L186.5 31.9 L203.5 25.9 L216.3 23.8 L219.1 31.9 L229.1 31.9 L233.3 31.9 L253.2 33.9 L278.8 33.9 L288.7 38 L288.7 42 L294.4 46.1 L294.4 58.2 L284.4 74.3 L290.1 78.4 L288.7 90.5 L297.2 102.6 L297.2 112.7 L288.7 116.8 L278.8 124.8 L277.3 132.9 L280.2 141 L270.2 139 L256 132.9 L239 137 L231.9 130.9 L222 130.9 L213.4 120.8 L204.9 114.7 L195 112.7 L190.7 118.8 L182.2 108.7 L172.3 104.6 L168 98.6 L163.7 90.5 L162.3 78.4 L162.3 70.3 L155.2 64.2 L159.5 54.1 Z";

const UA_PATH =
  "M290.1 90.5 L302.9 88.5 L324.2 88.5 L349.8 90.5 L369.6 92.5 L388.1 90.5 L392.4 78.4 L406.6 78.4 L420.8 74.3 L430.7 74.3 L442.1 86.5 L443.5 96.6 L454.8 104.6 L460.5 112.7 L476.1 114.7 L488.9 116.8 L497.4 122.8 L517.3 124.8 L525.8 134.9 L520.2 147.1 L521.6 157.2 L507.4 165.2 L497.4 169.3 L497.4 179.4 L487.5 181.4 L476.1 187.5 L457.7 193.5 L450.6 199.6 L454.8 205.6 L474.7 215.7 L471.9 219.8 L454.8 221.8 L442.1 231.9 L430.7 233.9 L429.3 221.8 L416.5 213.7 L432.1 203.6 L425 199.6 L409.4 195.5 L402.3 189.5 L390.9 193.5 L386.7 201.6 L375.3 215.7 L364 215.7 L355.4 211.7 L362.5 199.6 L369.6 191.5 L381 191.5 L375.3 183.4 L356.9 159.2 L345.5 153.1 L335.6 157.2 L324.2 163.2 L308.6 167.3 L298.6 163.2 L281.6 161.2 L270.2 153.1 L274.5 143 L280.2 141 L277.3 132.9 L278.8 124.8 L288.7 116.8 L297.2 112.7 L297.2 102.6 L288.7 90.5 Z";

const CITY_COORDS: Record<string, [number, number]> = {
  Целле: [98.1, 67.9],
  Ганновер: [93.2, 72.9],
  Вольфсбург: [108.2, 71.9],
  Брауншвейг: [104.4, 75.1],
  Гамбург: [97.0, 49.1],
  Берлін: [145.3, 69.9],
  Львів: [296.2, 124.0],
  Стрий: [293.7, 135.7],
  Долина: [295.8, 141.6],
  "Івано-Франківськ": [305.9, 142.6],
};

/**
 * Geographic corridor map plate: real projected borders of Germany, Poland, and Ukraine,
 * with plotted route cities, transit corridor through Wrocław, and country orientation.
 */
export function AtlasComposition({
  originLabel,
  destinationLabel,
  originCountryCode = "UA",
  destinationCountryCode = "DE",
  corridor,
  className,
  animate = true,
}: {
  originLabel: string;
  destinationLabel: string;
  originCountryCode?: string;
  destinationCountryCode?: string;
  corridor: string[];
  className?: string;
  animate?: boolean;
}) {
  const isWestbound = originCountryCode === "UA" || destinationCountryCode === "DE";
  const leftCityName = isWestbound ? destinationLabel : originLabel;
  const rightCityName = isWestbound ? originLabel : destinationLabel;

  const [deX, deY] = CITY_COORDS[leftCityName] ?? [98.1, 67.9];
  const [uaX, uaY] = CITY_COORDS[rightCityName] ?? [296.2, 124.0];
  const [transitX, transitY] = [197.0, 98.4];

  const startX = isWestbound ? uaX : deX;
  const startY = isWestbound ? uaY : deY;
  const endX = isWestbound ? deX : uaX;
  const endY = isWestbound ? deY : uaY;

  const corridorSummary =
    corridor.length >= 2 ? corridor.join(" → ") : `${originCountryCode} → ${destinationCountryCode}`;

  return (
    <div
      aria-hidden
      className={cn(
        "min-w-0 select-none overflow-hidden border border-border-strong bg-card p-3.5 sm:p-4 [overflow-wrap:anywhere]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
          Карта коридору
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
          {originCountryCode} → PL → {destinationCountryCode}
        </span>
      </div>

      <svg viewBox="0 0 560 250" className="mt-3 h-auto w-full text-primary">
        {/* Geographic graticule lines */}
        <g opacity="var(--graticule-opacity)" stroke="currentColor" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line key={`v${i}`} x1={40 + i * 80} y1="10" x2={40 + i * 80} y2="240" />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`h${i}`} x1="16" y1={32 + i * 50} x2="544" y2={32 + i * 50} />
          ))}
        </g>

        {/* Real projected country silhouettes: Germany, Poland (transit), Ukraine */}
        <g stroke="currentColor" strokeLinejoin="round">
          <path
            d={PL_PATH}
            fill="currentColor"
            fillOpacity="0.07"
            strokeWidth="0.9"
            strokeOpacity="0.32"
          />
          <path
            d={DE_PATH}
            fill="currentColor"
            fillOpacity="0.14"
            strokeWidth="1.1"
            strokeOpacity="0.48"
          />
          <path
            d={UA_PATH}
            fill="currentColor"
            fillOpacity="0.14"
            strokeWidth="1.1"
            strokeOpacity="0.48"
          />
        </g>

        {/* Subtle country cartographic watermark labels */}
        <g
          className="fill-muted-foreground"
          opacity="0.72"
          style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em" }}
        >
          <text x="104" y="138" textAnchor="middle">
            НІМЕЧЧИНА
          </text>
          <text x="226" y="54" textAnchor="middle">
            ПОЛЬЩА
          </text>
          <text x="424" y="152" textAnchor="middle">
            УКРАЇНА
          </text>
        </g>

        {/* Reference capital anchors */}
        <g className="fill-muted-foreground" opacity="0.65">
          {leftCityName !== "Берлін" ? (
            <>
              <circle cx="145.3" cy="69.9" r="1.8" />
              <text
                x="145.3"
                y="62.5"
                textAnchor="middle"
                style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, letterSpacing: "0.08em" }}
              >
                Берлін
              </text>
            </>
          ) : null}
          <circle cx="253.3" cy="75.8" r="1.8" />
          <text
            x="253.3"
            y="68.5"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, letterSpacing: "0.08em" }}
          >
            Варшава
          </text>
          <circle cx="388.4" cy="111.7" r="1.8" />
          <text
            x="388.4"
            y="104.5"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, letterSpacing: "0.08em" }}
          >
            Київ
          </text>
        </g>

        {/* Compass north indicator */}
        <g opacity="0.55" fill="none" stroke="currentColor" strokeWidth="1.1">
          <path d="M532 42V22M532 22l-4 6M532 22l4 6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text
          x="532"
          y="55"
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.14em" }}
        >
          N
        </text>

        {/* Corridor trajectory through Lower Silesia (Wrocław) */}
        <path
          d={`M${uaX} ${uaY} Q ${(uaX + transitX) / 2} ${uaY - 20} ${transitX} ${transitY} Q ${(deX + transitX) / 2} ${transitY - 8} ${deX} ${deY}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={animate ? 900 : undefined}
          className={animate ? "route-line-draw" : undefined}
        />

        {/* Origin marker */}
        <circle cx={startX} cy={startY} r="4.8" fill="currentColor" />
        <circle
          cx={startX}
          cy={startY}
          r="10.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.38"
        />

        {/* Transit corridor waypoint */}
        <circle cx={transitX} cy={transitY} r="2.8" fill="currentColor" opacity="0.72" />

        {/* Destination marker with signal accent */}
        <circle
          cx={endX}
          cy={endY}
          r="12"
          fill="none"
          className="stroke-accent route-node-pulse"
          strokeWidth="1.1"
        />
        <circle cx={endX} cy={endY} r="5.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx={endX} cy={endY} r="2.6" className="fill-accent" />

        {/* Plotted route city labels */}
        <g
          className="fill-foreground"
          style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em" }}
        >
          <text x={deX} y={deY - 12} textAnchor="middle">
            {leftCityName.toUpperCase()}
          </text>
          <text x={uaX + 9} y={uaY + 15} textAnchor="start">
            {rightCityName.toUpperCase()}
          </text>
        </g>
      </svg>

      <div className="mt-2 grid gap-2 border-t border-border pt-2.5 text-xs sm:grid-cols-2">
        <div className="min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Відправлення
          </span>
          <span className="mt-0.5 block truncate font-medium text-foreground">{originLabel}</span>
        </div>
        <div className="min-w-0 sm:text-right">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Адресне прибуття
          </span>
          <span className="mt-0.5 block truncate font-medium text-foreground">{destinationLabel}</span>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Орієнтовна карта коридору {corridorSummary} · без позначення зупинок у дорозі
      </p>
    </div>
  );
}
