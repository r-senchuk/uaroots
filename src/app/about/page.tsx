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

const title = "Про UARoute — платформа маршрутів з України до Європи";
const description =
  "UARoute — інформаційна платформа про маршрути з України до Європи. Ми не є перевізником: перевезення виконують партнери, зокрема Koval.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/about/" });

const principles = [
  {
    title: "Ми не перевізник",
    text: "UARoute не продає квитки, не формує розкладів і не підтверджує місця. Перевезення виконують транспортні компанії — партнери платформи. Наразі це Koval (KOVAL 4K).",
  },
  {
    title: "Тільки підтверджені факти",
    text: "Ми свідомо не публікуємо тривалості поїздки, розкладів, цін чи кількості місць, поки ці дані не підтверджені перевізником. Замість вигаданих цифр — перелік того, що варто уточнити.",
  },
  {
    title: "Ваш номер залишається вашим",
    text: "Повідомлення з маршрутом, датою, кількістю пасажирів і номером формується у вашому WhatsApp. UARoute не зберігає ці дані.",
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
          <h1 className="mt-6 max-w-3xl type-display">Атлас, а не каса</h1>
          <p className="mt-8 max-w-xl type-lead text-muted-foreground">
            UARoute — інформаційна платформа про маршрути з України до Європи. Ми допомагаємо знайти
            напрямок, зрозуміти, що про нього відомо, і підготувати запит до перевізника.
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
              атласу напрямків
            </Link>
            .
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
              <PartnerCard carrier={publicCarrier(koval)} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
