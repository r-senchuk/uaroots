import type { ReactNode } from "react";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Eyebrow } from "@/components/brand/editorial";
import { Graticule } from "@/components/brand/graphics";
import { JsonLd } from "@/components/JsonLd";
import { business } from "@/config/business";
import { breadcrumbLd, buildMetadata, imprintPageLd } from "@/lib/seo";

const title = "Відомості про оператора UARoute";
const description = "Оператор UARoute — Roman Senchuk, польська JDG. Бізнес-бренд Crew Bravo, контактні дані та роль транспортного партнера.";
const crumbs = [{ name: "Головна", path: "/" }, { name: "Відомості про оператора", path: "/imprint/" }];

export const metadata = buildMetadata({
  title,
  description,
  path: "/imprint/",
});

export default function ImprintPage() {
  const operatorDetails: ReadonlyArray<readonly [string, ReactNode]> = [
    ["Оператор", business.operatorName],
    ["Форма діяльності", business.legalForm],
    ["Бізнес-бренд", business.brand],
    ["Контактна адреса", business.contactAddress],
    [
      "Електронна пошта",
      <a key="email" className="inline-flex min-h-11 max-w-full items-center break-all text-primary link-underline" href={`mailto:${business.email}`}>
        {business.email}
      </a>,
    ],
    [
      "Бізнес-сайт",
      <a
        key="website"
        className="inline-flex min-h-11 max-w-full items-center break-all text-primary link-underline"
        href={business.website}
        target="_blank"
        rel="noopener noreferrer"
      >
        Crew Bravo ↗
      </a>,
    ],
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={imprintPageLd(title, description)} />

      <header className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-8 pt-4">
          <Breadcrumbs items={crumbs} />
          <p className="mt-4">
            <Eyebrow>Юридична інформація</Eyebrow>
          </p>
          <h1 className="mt-4 max-w-2xl type-h1">Відомості про оператора</h1>
        </div>
      </header>

      <div className="container-page py-8 sm:py-10">
        <div className="min-w-0 max-w-2xl space-y-10 type-body [overflow-wrap:anywhere]">
          <section className="min-w-0">
            <h2 className="type-h2">Хто керує UARoute</h2>
            <p className="mt-4 text-muted-foreground">
              UARoute — продукт у межах підприємницької діяльності {business.operatorName}. UARoute не є окремою юридичною особою.
            </p>
            <dl className="mt-6 divide-y divide-border border border-border-strong bg-card [overflow-wrap:anywhere]">
              {operatorDetails.map(([label, value]) => (
                <div key={label} className="grid min-w-0 gap-1 p-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center sm:gap-4 [overflow-wrap:anywhere]">
                  <dt className="type-label text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="min-w-0 border-t-2 border-border-strong pt-6">
            <h2 className="type-h2">Роль перевізника</h2>
            <p className="mt-4 text-muted-foreground">
              UARoute допомагає знайти напрямок і підготувати запит. Транспортний партнер — перевізник. Він перевіряє можливість поїздки, узгоджує умови з пасажиром і відповідає за перевезення.
            </p>
            <p className="mt-3 text-muted-foreground">
              Саме повідомлення у WhatsApp не резервує місце. Можливість поїздки та її умови погоджує перевізник. Для питань про саму поїздку звертайтеся до перевізника, з яким ви її погодили.
            </p>
          </section>

          <p>
            <Link href="/privacy/" className="inline-flex min-h-11 max-w-full items-center break-all text-primary link-underline">
              Як працює приватність і передавання даних →
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}