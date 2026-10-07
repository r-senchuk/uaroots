"use client";

import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { RoutePattern } from "@/components/brand/graphics";
import { KovalReferralLink } from "@/components/KovalReferralLink";
import { getCarrier } from "@/data/carriers";

export function Footer() {
  const koval = getCarrier("koval");

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border-strong bg-surface">
      <RoutePattern />

      <div className="container-page relative grid gap-10 py-14 sm:grid-cols-[1.4fr_1fr] sm:gap-16">
        <div className="max-w-md">
          <Logo showTagline />
          <p className="mt-6 type-body-small text-muted-foreground">
            UARoute допомагає вибрати міста, підготуватися до дороги й скласти повідомлення
            перевізнику. Організацію перевезення, можливість поїздки на вашу дату та умови
            ви погоджуєте з перевізником Коваль.
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
            <li className="rule-hair">
              <Link href="/imprint/" className="block py-3 text-sm hover:text-primary">Відомості про оператора</Link>
            </li>
            <li className="rule-hair">
              <Link href="/privacy/" className="block py-3 text-sm hover:text-primary">Приватність</Link>
            </li>
            {koval ? (
              <li className="rule-hair">
                <KovalReferralLink
                  href={koval.website}
                  content="footer"
                  ctaLocation="footer"
                  className="block py-3 text-sm hover:text-primary"
                >
                  Сайт перевізника Коваль ↗
                </KovalReferralLink>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>

      <AnalyticsConsent />
      <div className="container-page relative flex flex-col gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-caption">Україна ↔ Європа · Атлас напрямків</p>
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
