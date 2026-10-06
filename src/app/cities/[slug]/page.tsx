import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { KovalReferralLink } from "@/components/KovalReferralLink";
import { RouteSearch } from "@/components/RouteSearch";
import { cities, getCity } from "@/data/cities";
import { cityHubPaths, pilotGermanCityIds, priorityOriginCityIds } from "@/data/discovery";
import { findRouteByCities, getResolvedRoute } from "@/data/queries";
import { breadcrumbLd, buildMetadata, travelPreviewImage } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

const hubs = cityHubPaths.map((path) => path.split("/")[2]!);
const hubDetails = {
  lviv: {
    cityName: "Львів",
    fromName: "зі Львова",
    toName: "до Львова",
    title: "Поїздки зі Львова до Німеччини та назад | UARoute",
    heading: "Поїздки зі Львова до Німеччини та назад",
    description: "Поїздки зі Львова до Німеччини та назад: вибір міста, поради про місце зустрічі, доїзд до посадки й подальшу дорогу. Уточніть умови у перевізника Коваль.",
    intro: "Плануєте виїзд зі Львова чи поїздку до Львова з Німеччини? Оберіть німецьке місто та перегляньте, як описати місце зустрічі, врахувати доїзд до посадки й продумати дорогу після прибуття.",
    outbound: "Зазначте зручний район, адресу чи орієнтир у Львові й запитайте про точне місце та час посадки. Якщо добираєтеся до Львова з іншого міста, повідомте про це перевізнику: так ви зможете обговорити час на дорогу до місця зустрічі.",
    returning: "Для виїзду з Німеччини додайте до повідомлення адресу або район зустрічі. Погодьте місце висадки у Львові. Якщо звідти їдете далі, уточніть очікуваний час прибуття й закладіть запас перед наступною поїздкою.",
    faq: [
      { question: "Що написати, якщо до Львова ще потрібно доїхати?", answer: "Повідомте, звідки добираєтеся та коли плануєте бути у Львові. Погодьте місце й час зустрічі, перш ніж купувати квитки на попередню ділянку шляху." },
      { question: "Чи потрібно одразу знати дату повернення?", answer: "Можна підготувати звернення лише для виїзду. Коли визначите дату повернення, перемкніть пошук на «До України» й складіть окреме повідомлення. Якщо хочете обговорити обидві поїздки одразу, додайте дату повернення в текст WhatsApp." },
      { question: "Що запитати, якщо подорожую з дитиною?", answer: "Укажіть вік дитини й запитайте про вартість, дитяче крісло, багаж та потрібні для перевезення умови. Перевізник має підтвердити, що можна організувати саме для вашої поїздки." },
    ],
    routeSlugs: ["lviv-hannover", "lviv-celle", "celle-lviv"],
  },
  "ivano-frankivsk": {
    cityName: "Івано-Франківськ",
    fromName: "з Івано-Франківська",
    toName: "до Івано-Франківська",
    title: "Поїздки з Івано-Франківська до Німеччини та назад | UARoute",
    heading: "Поїздки з Івано-Франківська до Німеччини та назад",
    description: "Івано-Франківськ ↔ Німеччина: оберіть місто й перегляньте поради про посадку, багаж та зустріч після прибуття. Погодьте поїздку з перевізником Коваль.",
    intro: "Куди в Німеччині хочете поїхати з Івано-Франківська — або звідки вирушаєте до нього? Оберіть місто й перегляньте, що запитати про посадку, великий багаж та зустріч після прибуття.",
    outbound: "Опишіть, де вам зручно сісти в Івано-Франківську: район, адресу або орієнтир. Запитайте про точне місце й час зустрічі. Заздалегідь повідомте кількість валіз та про великий багаж, щоб обговорити умови й вартість його перевезення.",
    returning: "Укажіть місто відправлення в Німеччині та бажаний район зустрічі. Запитайте про місце висадки в Івано-Франківську. Якщо вас зустрічатимуть або ви плануєте їхати далі, з’ясуйте очікуваний час прибуття та як підтримувати зв’язок у дорозі.",
    faq: [
      { question: "Як зазначити дату, якщо можу виїхати в різні дні?", answer: "Виберіть бажану дату у формі, а в повідомленні WhatsApp додайте інші дні, які вам підходять. Запитайте перевізника, на яку з цих дат можна погодити поїздку." },
      { question: "Як описати великий багаж?", answer: "Напишіть кількість валіз і приблизні розміри великої речі. Запитайте, чи можна взяти її з собою та скільки коштуватиме перевезення. Погодьте ці умови до виїзду." },
      { question: "Як спланувати зустріч після повернення до Івано-Франківська?", answer: "Погодьте місце висадки й очікуваний час прибуття. Запитайте, як дізнатися про зміну часу в дорозі, та передайте ці деталі тим, хто вас зустрічає." },
    ],
    routeSlugs: ["ivano-frankivsk-wolfsburg", "wolfsburg-ivano-frankivsk"],
  },
} as const;

export function generateStaticParams() {
  return hubs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const details = hubDetails[slug as keyof typeof hubDetails];
  if (!details) return { title: "Місто не знайдено | UARoute", robots: { index: false } };
  return buildMetadata({ title: details.title, description: details.description, path: `/cities/${slug}/`, socialImage: travelPreviewImage });
}

export default async function CityHubPage({ params }: PageProps) {
  const { slug } = await params;
  const city = getCity(slug);
  const details = hubDetails[slug as keyof typeof hubDetails];
  if (!city || !details || !priorityOriginCityIds.includes(city.id as (typeof priorityOriginCityIds)[number])) notFound();

  const crumbs = [
    { name: "Головна", path: "/" },
    { name: "Маршрути", path: "/routes/" },
    { name: city.name, path: `/cities/${city.slug}/` },
  ];
  const germanCities = pilotGermanCityIds.map((id) => cities.find((candidate) => candidate.id === id)!).filter(Boolean);
  const routeCards = details.routeSlugs
    .map((routeSlug) => getResolvedRoute(routeSlug))
    .filter((route) => route?.status === "commercial");

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <section className="border-b border-border-strong">
        <div className="container-page pb-8 pt-8 sm:pb-10">
          <Breadcrumbs items={crumbs} />
          <p className="mt-6 type-label text-muted-foreground">Виїзд і повернення</p>
          <h1 className="mt-3 max-w-4xl type-h1">{details.heading}</h1>
          <p className="mt-4 max-w-3xl type-body text-muted-foreground">{details.intro}</p>
          <div className="mt-6 max-w-3xl border-l-2 border-primary pl-4">
            <p className="type-body-small text-muted-foreground">Можливість поїздки на вашу дату, наявність місць, місця посадки й висадки та ціну підтверджує перевізник Коваль у відповідь на звернення.</p>
          </div>
        </div>
      </section>

      <section className="container-page py-8 sm:py-10" aria-labelledby="search-heading">
        <p className="type-label text-muted-foreground">Вибір напрямку</p>
        <h2 id="search-heading" className="mt-3 type-h2">Куди хочете їхати?</h2>
        <p className="mt-3 max-w-2xl type-body-small text-muted-foreground">
          {details.cityName} вже вибрано. Додайте місто в Німеччині, а для повернення натисніть «До України» — вибрана пара міст збережеться.
        </p>
        <div className="mt-8 max-w-5xl border border-border-strong p-5 sm:p-8">
          <RouteSearch key={city.id} sourcePath={`/cities/${city.slug}/`} ctaLocation="route_index" initialOriginId={city.id} showPilotChoices />
        </div>
      </section>

      <section className="border-y border-border-strong bg-secondary/40">
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="type-label text-muted-foreground">Як їхати {details.fromName}</p>
            <h2 className="mt-3 type-h2">Підготуйте виїзд</h2>
            <p className="mt-4 max-w-xl type-body text-muted-foreground">{details.outbound}</p>
          </div>
          <div>
            <p className="type-label text-muted-foreground">Як повертатися {details.toName}</p>
            <h2 className="mt-3 type-h2">Підготуйте повернення</h2>
            <p className="mt-4 max-w-xl type-body text-muted-foreground">{details.returning}</p>
          </div>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <p className="type-label text-muted-foreground">Міста для поїздки</p>
        <h2 className="mt-3 type-h2">Шість міст Німеччини</h2>
        <p className="mt-3 max-w-2xl type-body-small text-muted-foreground">
          Якщо вже знаєте місто, виберіть його в пошуку. Посилання нижче ведуть до порад для окремих напрямків.
        </p>
        <ul className="mt-7 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {germanCities.map((destination) => {
            const outward = findRouteByCities(city.id, destination.id, { commercialOnly: true });
            const inward = findRouteByCities(destination.id, city.id, { commercialOnly: true });
            return (
              <li key={destination.id} className="border-t border-border-strong py-4">
                <h3 className="font-display text-xl">{destination.name} <span className="type-body-small text-muted-foreground">({destination.aliases[0]})</span></h3>
                {outward || inward ? (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {outward ? <Link className="inline-flex min-h-11 items-center link-underline" href={`/routes/${outward.slug}/`}>{city.name} → {destination.name}</Link> : null}
                    {inward ? <Link className="inline-flex min-h-11 items-center link-underline" href={`/routes/${inward.slug}/`}>{destination.name} → {city.name}</Link> : null}
                  </div>
                ) : <a href="#search-heading" className="mt-1 inline-flex min-h-11 items-center type-body-small link-underline">Обрати місто в пошуку ↑</a>}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-y border-border-strong bg-secondary/40">
        <div className="container-page py-12 sm:py-16">
          <p className="type-label text-muted-foreground">Поради для вашого напрямку</p>
          <h2 className="mt-3 type-h2">Місце зустрічі, прибуття та підготовка</h2>
          <p className="mt-3 max-w-2xl type-body-small text-muted-foreground">
            Перегляньте поради для потрібної пари міст, перш ніж писати перевізнику. Вони допоможуть описати зручне місце зустрічі та продумати подальшу дорогу.
          </p>
          <ul className="mt-7 grid gap-4 md:grid-cols-2">
            {routeCards.map((route) => (
              <li key={route!.slug} className="border border-border-strong p-5">
                <h3 className="font-display text-xl">{route!.title}</h3>
                <p className="mt-2 type-body-small text-muted-foreground">{route!.description}</p>
                <Link className="mt-4 inline-flex min-h-11 items-center link-underline" href={`/routes/${route!.slug}/`}>Поради: {route!.title}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-8"><Faq items={[...details.faq]} /></div>
          <p className="mt-8 max-w-2xl type-body-small text-muted-foreground">
            Повертаєтеся до планування пізніше? Збережіть посилання на потрібний напрямок.
            Для наступної поїздки дату та умови потрібно погодити заново.
          </p>
          <KovalReferralLink
            href="https://www.4k-koval.com/"
            content="site_route_index"
            ctaLocation="route_index"
            referralContext={{ originCityId: city.id, sourcePath: `/cities/${city.slug}/` }}
            className="mt-5 inline-flex min-h-11 items-center type-button text-primary link-underline"
          >
            Контакти перевізника Коваль на його сайті ↗
          </KovalReferralLink>
          <p className="mt-2 type-caption text-muted-foreground">Відкриється сайт перевізника.</p>
          <p className="mt-6 border-t border-border-strong pt-5 type-body-small">
            <Link className="link-underline" href={city.id === "lviv" ? "/cities/ivano-frankivsk/" : "/cities/lviv/"}>
              Напрямки {city.id === "lviv" ? "з Івано-Франківська" : "зі Львова"} →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
