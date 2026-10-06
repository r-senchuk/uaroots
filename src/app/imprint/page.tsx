import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { business } from "@/config/business";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Відомості про оператора UARoute",
  description: "Оператор UARoute — Roman Senchuk, польська JDG. Бізнес-бренд Crew Bravo, контактні дані та роль транспортного партнера Коваль.",
  path: "/imprint/",
});

export default function ImprintPage() {
  return (
    <div className="container-page py-10 sm:py-16">
      <Breadcrumbs items={[{ name: "Головна", path: "/" }, { name: "Відомості про оператора", path: "/imprint/" }]} />
      <h1 className="mt-10 max-w-3xl type-display">Відомості про оператора</h1>
      <div className="mt-10 max-w-2xl space-y-8 type-body">
        <section>
          <h2 className="type-h2">Хто керує UARoute</h2>
          <p className="mt-4">UARoute — продукт у межах підприємницької діяльності {business.operatorName}. UARoute не є окремою юридичною особою.</p>
          <dl className="mt-5 space-y-3">
            <div><dt className="type-label">Оператор</dt><dd className="mt-1">{business.operatorName}</dd></div>
            <div><dt className="type-label">Форма діяльності</dt><dd className="mt-1">{business.legalForm}</dd></div>
            <div><dt className="type-label">Бізнес-бренд</dt><dd className="mt-1">{business.brand}</dd></div>
            <div><dt className="type-label">Контактна адреса</dt><dd className="mt-1">{business.contactAddress}</dd></div>
            <div><dt className="type-label">Електронна пошта</dt><dd className="mt-1"><a className="link-underline" href={`mailto:${business.email}`}>{business.email}</a></dd></div>
            <div><dt className="type-label">Бізнес-сайт</dt><dd className="mt-1"><a className="link-underline" href={business.website} target="_blank" rel="noopener noreferrer">Crew Bravo ↗</a></dd></div>
          </dl>
        </section>
        <section>
          <h2 className="type-h2">Роль перевізника</h2>
          <p className="mt-4">UARoute допомагає знайти напрямок і підготувати запит. Транспортний партнер — перевізник Коваль. Він перевіряє можливість поїздки, узгоджує умови з пасажиром і відповідає за перевезення.</p>
          <p className="mt-3">Саме повідомлення у WhatsApp не резервує місце. Можливість поїздки та її умови погоджує перевізник. Для питань про саму поїздку звертайтеся до перевізника, з яким ви її погодили.</p>
        </section>
        <p><Link href="/privacy/" className="link-underline">Як працює приватність і передавання даних →</Link></p>
      </div>
    </div>
  );
}
