import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BicycleInquiryCta } from "@/components/BicycleInquiryCta";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { getDesk } from "@/data/carriers";
import { absoluteUrl } from "@/config/site";
import { breadcrumbLd, buildMetadata, travelPreviewImage } from "@/lib/seo";
const path = "/guides/perevezennya-velosypeda/";
const title = "Перевезення велосипеда: що погодити з перевізником | UARoute";
const description = "Як запитати про перевезення велосипеда: тип, розміри, пакування, дата та вартість. Можливість перевезення підтверджує перевізник.";
export const metadata: Metadata = buildMetadata({title,description,path,type:"article",socialImage:travelPreviewImage});
const crumbs=[{name:"Головна",path:"/"},{name:"Про UARoute",path:"/about/"},{name:"Перевезення велосипеда",path}];
const faq=[
 {question:"Що повідомити про велосипед?",answer:"Назвіть тип, розміри та приблизну вагу велосипеда. Для електровелосипеда окремо опишіть акумулятор і запитайте, чи можливе перевезення."},
 {question:"Як підготувати велосипед?",answer:"Спочатку погодьте вимоги до пакування та допустимі габарити. Потребу розбирання й порядок робіт уточніть для вашої моделі; за потреби зверніться до майстра."},
 {question:"Що погодити до виїзду?",answer:"Запитайте про можливість перевезення на потрібну дату, загальну вартість, завантаження й отримання велосипеда. Не купуйте пакування лише на підставі загальних порад."}
];
export default function BicycleTransportGuidePage(){
 const desk=getDesk("koval","koval-de");
 return <article className="container-page py-8 sm:py-12">
 <JsonLd data={breadcrumbLd(crumbs)}/>
 <JsonLd data={{"@context":"https://schema.org","@type":"Article",headline:title,description,datePublished:"2026-10-17",dateModified:"2026-10-25",mainEntityOfPage:absoluteUrl(path),inLanguage:"uk",author:{"@type":"Organization",name:"UARoute"}}}/>
 <Breadcrumbs items={crumbs}/>
 <h1 className="mt-6 max-w-2xl type-h1">Перевезення велосипеда: що погодити з перевізником</h1>
 <p className="mt-5 max-w-2xl type-body text-muted-foreground">Хочете взяти велосипед у поїздку? Повідомте перевізнику його тип, розміри та бажану дату, щоб з’ясувати можливість перевезення.</p>
 <section className="mt-8 max-w-2xl" aria-labelledby="bike-questions"><h2 id="bike-questions" className="type-h2">Підготуйте короткий запит</h2><div className="mt-5 [&_details_p]:text-base"><Faq items={faq}/></div></section>
 <section className="mt-10 max-w-2xl" aria-labelledby="customs-heading"><h2 id="customs-heading" className="type-h2">Де перевірити митні правила</h2><p className="mt-4 type-body">Правила залежать від напрямку та обставин подорожі. Перевірте актуальні вимоги для України в <a className="link-underline" href="https://customs.gov.ua/informatsiia-dlia-gromadian" target="_blank" rel="noopener noreferrer">офіційних роз’ясненнях Державної митної служби України ↗</a>. Для в’їзду до іншої країни перевірте також правила її митної служби.</p></section>
 <section className="mt-10 max-w-2xl border-t border-border-strong pt-6"><h2 className="type-h2">Зверніться до перевізника</h2><p className="mt-4 text-sm">У WhatsApp відкриється підготовлений текст. Доповніть його й надішліть самостійно. Перевізник підтвердить можливість та умови; звернення не резервує місце.</p>{desk ? <BicycleInquiryCta whatsappNumber={desk.whatsapp} className="mt-5"/>:null}</section>
 <nav className="mt-8 flex flex-wrap gap-5 text-sm" aria-label="Планування поїздки"><Link className="inline-flex min-h-11 items-center link-underline" href="/cities/lviv/">Львів ↔ Німеччина</Link><Link className="inline-flex min-h-11 items-center link-underline" href="/cities/ivano-frankivsk/">Івано-Франківськ ↔ Німеччина</Link><Link className="inline-flex min-h-11 items-center link-underline" href="/cities/stryi/">Стрий ↔ Німеччина</Link><Link className="inline-flex min-h-11 items-center link-underline" href="/cities/celle/">Целле ↔ Україна</Link><Link className="inline-flex min-h-11 items-center link-underline" href="/routes/">Усі маршрути</Link></nav>
 </article>;
}
