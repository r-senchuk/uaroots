import type { Metadata } from "next";
import Link from "next/link";

import { BicycleInquiryCta } from "@/components/BicycleInquiryCta";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Eyebrow, chipLink } from "@/components/brand/editorial";
import { Graticule } from "@/components/brand/graphics";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { getDesk } from "@/data/carriers";
import { breadcrumbLd, buildMetadata, guideArticleLd, travelPreviewImage } from "@/lib/seo";

const path = "/guides/perevezennya-velosypeda/";
const title = "Перевезення велосипеда: що погодити з перевізником | UARoute";
const description =
  "Як запитати про перевезення велосипеда: тип, розміри, пакування, дата та вартість. Можливість перевезення підтверджує перевізник.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path,
  type: "article",
  socialImage: travelPreviewImage,
});

const crumbs = [
  { name: "Головна", path: "/" },
  { name: "Про UARoute", path: "/about/" },
  { name: "Перевезення велосипеда", path },
];

const faq = [
  {
    question: "Що повідомити про велосипед?",
    answer:
      "Назвіть тип, розміри та приблизну вагу велосипеда. Для електровелосипеда окремо опишіть акумулятор і запитайте, чи можливе перевезення.",
  },
  {
    question: "Як підготувати велосипед?",
    answer:
      "Спочатку погодьте вимоги до пакування та допустимі габарити. Потребу розбирання й порядок робіт уточніть для вашої моделі; за потреби зверніться до майстра.",
  },
  {
    question: "Що погодити до виїзду?",
    answer:
      "Запитайте про можливість перевезення на потрібну дату, загальну вартість, завантаження й отримання велосипеда. Не купуйте пакування лише на підставі загальних порад.",
  },
];

export default function BicycleTransportGuidePage() {
  const desk = getDesk("koval", "koval-de");
  return (
    <article>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={guideArticleLd({
          title,
          description,
          path,
          datePublished: "2026-10-17",
          dateModified: "2026-10-25",
        })}
      />

      <header className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-8 pt-4">
          <Breadcrumbs items={crumbs} />
          <p className="mt-4">
            <Eyebrow>Практичні поради · Багаж</Eyebrow>
          </p>
          <h1 className="mt-4 max-w-2xl type-h1">Перевезення велосипеда: що погодити з перевізником</h1>
          <p className="mt-5 max-w-2xl type-body text-foreground/85">
            Хочете взяти велосипед у поїздку? Повідомте перевізнику його тип, розміри та бажану дату, щоб з’ясувати можливість перевезення.
          </p>
        </div>
      </header>

      <div className="container-page space-y-10 py-8 sm:py-10">
        <section className="min-w-0 max-w-2xl border-t-2 border-border-strong pt-6 [overflow-wrap:anywhere]" aria-labelledby="bike-questions">
          <h2 id="bike-questions" className="type-h2">Підготуйте короткий запит</h2>
          <div className="mt-5 [&_details_p]:text-base">
            <Faq items={faq} />
          </div>
        </section>

        <section className="min-w-0 max-w-2xl border-t-2 border-border-strong pt-6 [overflow-wrap:anywhere]" aria-labelledby="customs-heading">
          <h2 id="customs-heading" className="type-h2">Де перевірити митні правила</h2>
          <p className="mt-4 type-body text-muted-foreground">
            Правила залежать від напрямку та обставин подорожі. Перевірте актуальні вимоги для України в{" "}
            <a
              className="link-underline text-primary"
              href="https://customs.gov.ua/informatsiia-dlia-gromadian"
              target="_blank"
              rel="noopener noreferrer"
            >
              офіційних роз’ясненнях Державної митної служби України ↗
            </a>
            . Для в’їзду до іншої країни перевірте також правила її митної служби.
          </p>
        </section>

        <section className="min-w-0 max-w-2xl border-t-2 border-border-strong pt-6 [overflow-wrap:anywhere]">
          <h2 className="type-h2">Зверніться до перевізника</h2>
          <p className="mt-4 type-body-small text-muted-foreground">
            У WhatsApp відкриється підготовлений текст. Доповніть його й надішліть самостійно. Перевізник підтвердить можливість та умови; звернення не резервує місце.
          </p>
          {desk ? <BicycleInquiryCta whatsappNumber={desk.whatsapp} className="mt-5" /> : null}
        </section>

        <nav className="flex max-w-2xl flex-wrap gap-3 border-t border-border-strong pt-6" aria-label="Планування поїздки">
          <Link className={chipLink} href="/cities/lviv/">Львів ↔ Німеччина</Link>
          <Link className={chipLink} href="/cities/ivano-frankivsk/">Івано-Франківськ ↔ Німеччина</Link>
          <Link className={chipLink} href="/cities/stryi/">Стрий ↔ Німеччина</Link>
          <Link className={chipLink} href="/cities/celle/">Целле ↔ Україна</Link>
          <Link className={chipLink} href="/routes/">Усі маршрути</Link>
        </nav>
      </div>
    </article>
  );
}