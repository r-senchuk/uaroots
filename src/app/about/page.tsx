import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import atlasCity from "@/assets/atlas-city.jpg";
import {
  Eyebrow,
  HouseIcon,
  IconTile,
  IndexBadge,
  ShieldIcon,
  chipLink,
} from "@/components/brand/editorial";
import { Graticule } from "@/components/brand/graphics";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { getCarrier, publicCarrier } from "@/data/carriers";
import { aboutPageLd, breadcrumbLd, buildMetadata } from "@/lib/seo";

const title = "Про UARoute — допомагаємо підготувати поїздку";
const description =
  "Як UARoute допомагає вибрати напрямок між Україною та Німеччиною, визначити питання про поїздку та зв’язатися з перевізником.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/about/" });

const principles = [
  {
    title: "Оберіть міста",
    text: "Знайдіть напрямок і перегляньте поради для підготовки. Для повернення перемкніть напрямок у пошуку — вибрані міста збережуться.",
  },
  {
    title: "Підготуйте звернення",
    text: "Додайте бажану дату, кількість пасажирів і телефон, щоб скласти повідомлення з вибраним напрямком. Сайт перевізника можна відкрити без заповнення дати й телефону.",
  },
  {
    title: "Перевірте й надішліть",
    text: "Основний спосіб звернення — WhatsApp: перевірте підготовлений текст і надішліть його перевізнику самостійно. Сайт перевізника — помітна альтернатива, доступна без дати й телефону. Перевізник підтвердить можливість поїздки та умови; звернення не резервує місце.",
  },
];

const crumbs = [
  { name: "Головна", path: "/" },
  { name: "Про UARoute", path: "/about/" },
];

export default function AboutPage() {
  const koval = getCarrier("koval");

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={aboutPageLd(title, description)} />

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-8 pt-4 sm:pb-8 sm:pt-6">
          <Breadcrumbs items={crumbs} />
          <p className="mt-4"><Eyebrow>Хто ми</Eyebrow></p>
          <h1 className="mt-4 max-w-2xl type-h1">Допомагаємо підготувати поїздку</h1>
          <p className="mt-4 max-w-2xl type-body text-foreground/85">
            Уже знаєте, куди хочете їхати, але ще потрібно домовитися про деталі?
            UARoute допоможе вибрати напрямок між Україною та Німеччиною,
            визначити питання про посадку, багаж і прибуття та зв’язатися з перевізником.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 max-w-2xl">
          <ol className="mt-0 divide-y divide-border border-t-2 border-border-strong">
            {principles.map((item, index) => (
              <li
                key={item.title}
                className="grid min-w-0 gap-3 py-6 [overflow-wrap:anywhere] sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5"
              >
                <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                  <IndexBadge index={index + 1} />
                </div>
                <div className="min-w-0">
                  <h2 className="min-w-0 font-display text-2xl leading-snug text-foreground">{item.title}</h2>
                  <p className="mt-3 max-w-xl type-body text-muted-foreground">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-8 type-body text-muted-foreground">
            Почніть із{" "}
            <Link href="/routes/" className="text-primary link-underline">
              вибору міст для поїздки
            </Link>
            .
          </p>
          <section className="mt-8 border border-border-strong bg-card p-5 [overflow-wrap:anywhere]" aria-labelledby="request-privacy-heading">
            <div className="flex min-w-0 items-start gap-3">
              <IconTile className="mt-0.5">
                <ShieldIcon />
              </IconTile>
              <div className="min-w-0">
                <h2 id="request-privacy-heading" className="type-h2">Ваші дані — для вашого звернення</h2>
                <p className="mt-3 max-w-xl type-body text-muted-foreground">
                  Телефон і дата потрібні для підготовки повідомлення. UARoute не зберігає їх
                  у базі клієнтів чи сховищі браузера та не передає в аналітику.
                  Коли ви відкриваєте WhatsApp, підготовлений текст передається цьому зовнішньому сервісу.
                </p>
              </div>
            </div>
          </section>
          <p className="mt-5 type-body text-muted-foreground">
            UARoute працює в межах польської JDG Roman Senchuk, під бізнес-брендом Crew Bravo.{" "}
            <Link href="/imprint/" className="link-underline">Відомості про оператора</Link>{" "}
            та <Link href="/privacy/" className="link-underline">приватність запитів</Link>.
          </p>
        </div>

        <aside className="min-w-0">
          <figure className="min-w-0 overflow-hidden border border-border-strong bg-card p-2.5 sm:p-3 [overflow-wrap:anywhere]">
            <div className="mb-2.5 flex min-w-0 flex-wrap items-center justify-between gap-2 px-1">
              <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <HouseIcon />
                <span>Україна ↔ Німеччина</span>
              </span>
            </div>
            <Image
              src={atlasCity}
              alt="Вулиця європейського міста призначення"
              sizes="(max-width: 1023px) 100vw, 380px"
              className="photo-atlas aspect-[16/9] w-full object-cover"
            />
            <figcaption className="mt-2.5 px-1 text-sm text-muted-foreground">Європейські міста призначення</figcaption>
          </figure>

          {koval ? (
            <div className="mt-8 [&_p]:text-base [&_a]:text-base">
              <PartnerCard carrier={publicCarrier(koval)} inquiryOnly />
            </div>
          ) : null}
        </aside>
      </div>

      <section className="container-page border-t border-border-strong py-14 sm:py-20" aria-labelledby="pilot-heading">
        <p className="type-label text-muted-foreground">Україна ↔ Німеччина</p>
        <h2 id="pilot-heading" className="mt-4 max-w-2xl scroll-mt-28 type-h1">
          Міські огляди й доступні напрямки
        </h2>
        <p className="mt-6 max-w-2xl type-lead text-muted-foreground">
          Оберіть місто в Україні та Німеччині. Для повернення перемкніть напрямок.
        </p>
        <p className="mt-4 max-w-2xl type-body text-muted-foreground">
          Почніть із міського огляду Львова чи Івано-Франківська або перейдіть до пошуку,
          щоб обрати інший доступний напрямок.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cities/lviv/" className={chipLink}>Львів ↔ Німеччина</Link>
          <Link href="/cities/ivano-frankivsk/" className={chipLink}>Івано-Франківськ ↔ Німеччина</Link>
          <Link href="/guides/perevezennya-velosypeda/" className={chipLink}>Перевезення велосипеда</Link>
        </div>
        <Link href="/routes/" className="mt-6 inline-flex min-h-11 items-center type-label text-primary link-underline">
          Інше українське місто? Перейдіть до вибору →
        </Link>
      </section>
    </>
  );
}
