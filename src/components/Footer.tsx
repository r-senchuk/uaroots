"use client";

import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { RoutePattern } from "@/components/brand/graphics";
import { withUtm } from "@/config/site";
import { getCarrier } from "@/data/carriers";
import { track } from "@/lib/analytics";

export function Footer() {
  const koval = getCarrier("koval");

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border-strong bg-surface">
      <RoutePattern />

      <div className="container-page relative grid gap-10 py-14 sm:grid-cols-[1.4fr_1fr] sm:gap-16">
        <div className="max-w-md">
          <Logo showTagline />
          <p className="mt-6 type-body-small text-muted-foreground">
            UARoute — інформаційна платформа про маршрути з України до Європи. Ми не є перевізником:
            перевезення виконують партнери, а ми допомагаємо знайти напрямок і підготувати запит.
          </p>
        </div>

        <nav aria-label="Додаткова навігація">
          <p className="type-label text-muted-foreground">Навігація</p>
          <ul className="mt-4 rule-strong">
            <li className="rule-hair first:border-t-0">
              <Link href="/routes/" className="block py-3 text-sm hover:text-primary">
                Маршрути
              </Link>
            </li>
            <li className="rule-hair">
              <Link href="/about/" className="block py-3 text-sm hover:text-primary">
                Про UARoute
              </Link>
            </li>
            {koval ? (
              <li className="rule-hair">
                <a
                  href={withUtm(koval.website, "footer")}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block py-3 text-sm hover:text-primary"
                  onClick={() =>
                    track("koval_site_click", {
                      ctaLocation: "footer",
                      conversionType: "koval_site",
                    })
                  }
                >
                  Сайт перевізника Koval ↗
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>

      <div className="container-page relative flex flex-col gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-caption">UA → EU · Інформаційний атлас маршрутів</p>
        <p className="flex items-center gap-2 type-caption">
          Розроблено{" "}
          <a
            href="https://crewbravo.com"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center"
            aria-label="CrewBravo"
          >
            <Image
              src="/crewbravo-logo.svg"
              alt="CrewBravo"
              width={54}
              height={18}
              className="h-[18px] w-auto"
            />
          </a>
        </p>
      </div>
    </footer>
  );
}
