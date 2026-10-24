import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import atlasCity from "@/assets/atlas-city.jpg";
import { Graticule } from "@/components/brand/graphics";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { getCarrier, publicCarrier } from "@/data/carriers";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";

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

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-14 pt-8">
          <Breadcrumbs items={crumbs} />
          <p className="mt-10 type-label text-muted-foreground">Хто ми</p>
          <h1 className="mt-6 max-w-3xl type-display">Допомагаємо підготувати поїздку</h1>
          <p className="mt-8 max-w-xl type-lead text-muted-foreground">
            Уже знаєте, куди хочете їхати, але ще потрібно домовитися про деталі?
            UARoute допоможе вибрати напрямок між Україною та Німеччиною,
            визначити питання про посадку, багаж і прибуття та зв’язатися з перевізником.
          </p>
        </div>
      </section>

      <div className="container-page section-band grid gap-14 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
        <div>
          <ol className="rule-strong">
            {principles.map((item, index) => (
              <li key={item.title} className="rule-hair py-8 first:border-t-0">
                <span className="type-index text-accent-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 type-h2">{item.title}</h2>
                <p className="mt-3 max-w-xl type-body text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 type-body text-muted-foreground">
            Почніть із{" "}
            <Link href="/routes/" className="text-primary link-underline">
              вибору міст для поїздки
            </Link>
            .
          </p>
          <section className="mt-10 border-t border-border-strong pt-6" aria-labelledby="request-privacy-heading">
            <h2 id="request-privacy-heading" className="type-h2">Ваші дані — для вашого звернення</h2>
            <p className="mt-3 max-w-xl type-body-small text-muted-foreground">
              Телефон і дата потрібні для підготовки повідомлення. UARoute не зберігає їх
              у базі клієнтів чи сховищі браузера та не передає в аналітику.
              Коли ви відкриваєте WhatsApp, підготовлений текст передається цьому зовнішньому сервісу.
            </p>
          </section>
          <p className="mt-5 type-body-small text-muted-foreground">
            UARoute працює в межах польської JDG Roman Senchuk, під бізнес-брендом Crew Bravo.{" "}
            <Link href="/imprint/" className="link-underline">Відомості про оператора</Link>{" "}
            та <Link href="/privacy/" className="link-underline">приватність запитів</Link>.
          </p>
        </div>

        <div>
          <Image
            src={atlasCity}
            alt="Вулиця європейського міста призначення"
            className="photo-atlas w-full object-cover"
          />
          <p className="mt-3 type-caption">Європейські міста призначення</p>

          {koval ? (
            <div className="mt-12">
              <PartnerCard carrier={publicCarrier(koval)} inquiryOnly />
            </div>
          ) : null}
        </div>
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
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/cities/lviv/" className="inline-flex min-h-11 items-center text-primary link-underline">Львів ↔ Німеччина</Link>
          <Link href="/cities/ivano-frankivsk/" className="inline-flex min-h-11 items-center text-primary link-underline">Івано-Франківськ ↔ Німеччина</Link>
        </div>
        <Link href="/routes/" className="mt-6 inline-flex min-h-11 items-center type-label text-primary link-underline">
          Інше українське місто? Перейдіть до вибору →
        </Link>
      </section>
    </>
  );
}
