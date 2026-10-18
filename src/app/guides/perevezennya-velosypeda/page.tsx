import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { PartnerCard } from "@/components/PartnerCard";
import { BicycleInquiryCta } from "@/components/BicycleInquiryCta";
import { Graticule } from "@/components/brand/graphics";
import { getCarrier, getDesk, publicCarrier } from "@/data/carriers";
import { breadcrumbLd, buildMetadata, travelPreviewImage } from "@/lib/seo";
import { absoluteUrl } from "@/config/site";

const pageTitle = "Перевезення велосипеда мікроавтобусом до Німеччини та Польщі: правила, митниця, пакування | UARoute";
const pageDescription = "Як перевезти велосипед бусом за кордон: правила розміщення у багажнику, частковий розбір за 15 хв, митні ліміти (ст. 370 МКУ) та перевірка номерів рами.";
const pagePath = "/guides/perevezennya-velosypeda/";

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: pagePath,
  type: "article",
  socialImage: travelPreviewImage,
});

const crumbs = [
  { name: "Головна", path: "/" },
  { name: "Поради", path: "/about/" },
  { name: "Перевезення велосипеда", path: pagePath },
];

const faqItems = [
  {
    question: "Де саме перевозиться велосипед у мікроавтобусі?",
    answer:
      "Велосипед перевозиться виключно у просторому багажному відділенні мікроавтобуса (8-місний Mercedes Sprinter). Навісних багажників на задніх дверях немає, тому байк обов’язково має бути частково розібраний і захищений м’яким пакуванням від тертя з валізами інших пасажирів.",
  },
  {
    question: "Як швидко підготувати велосипед до завантаження?",
    answer:
      "Достатньо 10–15 хвилин: зніміть переднє колесо й зафіксуйте його вздовж рами через м’яку прокладку, викрутіть педалі або закрутіть їх усередину, послабте винос і розверніть кермо на 90° паралельно рамі, опустіть сідло та захистіть задній перемикач картоном або плівкою.",
  },
  {
    question: "Які митні правила та ліміти діють на кордоні?",
    answer:
      "При виїзді з України власний вживаний велосипед є особистою річчю (ст. 370 МКУ, 0% мита). При ввезенні придбаного в ЄС велосипеда в Україну через автомобільні пункти пропуску безмитна норма становить до 500 € та до 50 кг (ст. 374 МКУ) за умови перебування за кордоном понад 24 години та в’їзду не частіше одного разу на 72 години. Якщо поїздка тривала менше 24 годин або в’їзд відбувається частіше одного разу протягом 72 годин, базою оподаткування є частина вартості, що перевищує еквівалент 50 євро (в межах загального обмеження 500 € та 50 кг). Для посилок без пасажира ліміт безмитного ввезення — до 150 € (ст. 234 МКУ). Обов’язково зберігайте товарний чек (Rechnung) або договір купівлі-продажу (Kaufvertrag).",
  },
  {
    question: "Чому прикордонна служба може перевіряти номер рами?",
    answer:
      "Посадові особи польської прикордонної служби (Straż Graniczna) та митниці мають право звіряти вибитий серійний номер на каретковому вузлі рами (Rahmennummer) з реєстрами розшукуваного майна, такими як SIS. У разі пошкодження номера, ознак його підробки чи збігу з базою розшуку транспортний засіб може бути затримано для з’ясування обставин. Завжди залишайте номер рами відкритим для огляду.",
  },
];

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Перевезення велосипеда мікроавтобусом до Німеччини та Польщі: інструкція пасажиру",
  description: pageDescription,
  image: absoluteUrl(travelPreviewImage.path),
  datePublished: "2026-10-17",
  dateModified: "2026-10-17",
  mainEntityOfPage: absoluteUrl(pagePath),
  inLanguage: "uk",
  author: {
    "@type": "Organization",
    name: "UARoute",
    url: absoluteUrl("/"),
  },
  publisher: {
    "@type": "Organization",
    name: "UARoute",
    url: absoluteUrl("/"),
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Як підготувати та спакувати велосипед для перевезення в багажнику мікроавтобуса",
  description: "Покрокова інструкція швидкого часткового розбирання та безпечного пакування велосипеда перед посадкою у мікроавтобус.",
  totalTime: "PT15M",
  step: [
    {
      "@type": "HowToStep",
      name: "Зняти переднє колесо",
      text: "Зніміть переднє колесо за допомогою ексцентрика або осі. Закріпіть колесо стяжками вздовж рами, проклавши між рамою та спицями шар картону чи тканини.",
    },
    {
      "@type": "HowToStep",
      name: "Демонтувати педалі",
      text: "Викрутіть педалі за допомогою ріжкового ключа на 15 мм або шестигранника (права педаль викручується проти годинникової стрілки, ліва — за годинниковою). Також можна вкрутити їх із внутрішнього боку шатунів.",
    },
    {
      "@type": "HowToStep",
      name: "Повернути кермо паралельно рамі",
      text: "Послабте гвинти виносу керма та розверніть кермо на 90 градусів уздовж верхньої труби рами, потім злегка підтягніть гвинти для фіксації в дорозі.",
    },
    {
      "@type": "HowToStep",
      name: "Опустити або зняти сідло",
      text: "Опустіть підсідельний штир у найнижче положення або повністю вийміть його та зафіксуйте вздовж рами скотчем чи стяжкою.",
    },
    {
      "@type": "HowToStep",
      name: "Захистити задній перемикач і ланцюг",
      text: "Переведіть ланцюг на найменшу зірку ззаду. Обмотайте задній перемикач передач і ланцюг пухирчастою плівкою або картоном, щоб захистити півник від деформації.",
    },
    {
      "@type": "HowToStep",
      name: "Залишити відкритим номер рами для митниці",
      text: "Очистіть серійний номер під кареткою від бруду й залиште вікно в упаковці, щоб прикордонники могли візуально звірити номер без розрізання плівки.",
    },
  ],
};

export default function BicycleTransportGuidePage() {
  const koval = getCarrier("koval");
  const desk = getDesk("koval", "koval-de");
  const whatsappNumber = desk?.whatsapp ?? "380509786330";

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={howToLd} />

      <section className="relative overflow-hidden border-b border-border-strong">
        <Graticule />
        <div className="container-page relative pb-12 pt-8 sm:pb-16">
          <Breadcrumbs items={crumbs} />
          <p className="mt-8 type-label text-muted-foreground">Практичний посібник пасажира</p>
          <h1 className="mt-4 max-w-4xl type-h1">
            Перевезення велосипеда мікроавтобусом до Німеччини та Польщі: інструкція пасажиру
          </h1>
          <p className="mt-6 max-w-2xl type-lead text-muted-foreground">
            Як перевезти велосипед за кордон без ризику пошкоджень, зайвих переплат чи затримок на кордоні:
            правила завантаження в багажне відділення Sprinter, частковий розбір за 15 хвилин та митні норми.
          </p>

          <div className="mt-8 grid gap-4 border border-border-strong bg-secondary/30 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="type-caption text-muted-foreground">Розміщення</p>
              <p className="mt-1 font-semibold text-foreground">Багажне відділення Sprinter</p>
            </div>
            <div>
              <p className="type-caption text-muted-foreground">Підготовка</p>
              <p className="mt-1 font-semibold text-foreground">Частковий розбір за 15 хв</p>
            </div>
            <div>
              <p className="type-caption text-muted-foreground">Митний ліміт ввезення</p>
              <p className="mt-1 font-semibold text-foreground">До 500 € без мита (ст. 374 МКУ)</p>
            </div>
            <div>
              <p className="type-caption text-muted-foreground">Перевірка рами</p>
              <p className="mt-1 font-semibold text-foreground">Бази SIS / Straż Graniczna</p>
            </div>
          </div>
        </div>
      </section>

      <article className="container-page py-12 sm:py-16">
        <div className="grid gap-14 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div className="space-y-12">
            <section aria-labelledby="why-van-heading">
              <h2 id="why-van-heading" className="type-h2">
                Чому 8-місний мікроавтобус зручніший за авіа, поїзди та великі автобуси
              </h2>
              <p className="mt-4 type-body text-muted-foreground">
                В умовах відсутності авіасполучення з України залізничні маршрути пропонують украй обмежену
                кількість веломісць, а пересадки на польських чи німецьких вокзалах із важким велосипедом і валізами
                створюють суттєвий стрес. Великі рейсові автобуси часто відмовляють у посадці з велосипедом без спеціальних
                заводських кейсів або якщо багажник уже заповнений коробками інших пасажирів.
              </p>
              <p className="mt-4 type-body text-muted-foreground">
                Мікроавтобуси перевізника «Коваль» (Mercedes Sprinter) мають містке багажне відділення. За умови
                попереднього погодження з водієм і компактного пакування, велосипед розміщується всередині безпечно,
                сухо й доставляється безпосередньо до потрібного міста або адреси в Німеччині.
              </p>
            </section>

            <section aria-labelledby="packing-heading" className="border-t border-border-strong pt-10">
              <h2 id="packing-heading" className="type-h2">
                Покрокова інструкція: підготовка та розбирання за 15 хвилин
              </h2>
              <p className="mt-4 type-body text-muted-foreground">
                Мікроавтобус не обладнаний зовнішніми кріпленнями на задніх дверях, щоб захистити техніку від дорожнього
                бруду, дощу та ризику крадіжки на стоянках. У багажнику велосипед їде компактно складеним:
              </p>

              <ol className="mt-6 space-y-6">
                <li className="border-l-2 border-primary pl-4">
                  <h3 className="type-h3">1. Зніміть переднє колесо</h3>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Послабте ексцентрик або викрутіть наскрізну вісь. Зніміть колесо та закріпіть його вздовж рами.
                    Обов’язково прокладіть між колесом і рамою картон, щоб ротор гальм або спиці не пошкодили фарбу рами.
                    Якщо гальма гідравлічні — вставте пластикову транспортувальну заглушку між колодками.
                  </p>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <h3 className="type-h3">2. Демонтуйте або розверніть педалі</h3>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Педалі — найбільш виступаюча частина, яка може пошкодити сусідній багаж. Зніміть їх (пам’ятайте: ліва
                    педаль має ліву різьбу й відкручується за годинниковою стрілкою) або вкрутіть їх зі зворотного боку всередину.
                  </p>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <h3 className="type-h3">3. Поверніть кермо паралельно рамі</h3>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Послабте два бічних болти виносу керма (кришку виносу відкручувати не потрібно). Поверніть кермо
                    на 90° уздовж верхньої труби рами та злегка зафіксуйте, щоб воно не бовталося в дорозі.
                  </p>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <h3 className="type-h3">4. Опустіть або зніміть сідло</h3>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Опустіть підсідельний штир у найнижчу точку, щоб зменшити висоту велосипеда, або повністю вийміть його та
                    прикріпіть до рами скотчем.
                  </p>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <h3 className="type-h3">5. Захистіть задній перемикач передач</h3>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Переведіть ланцюг на найменшу зірку задньої касети — так лапка перемикача притиснеться ближче до рами.
                    Щільно обмотайте перемикач пухирчастою плівкою або цупким картоном.
                  </p>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <h3 className="type-h3">6. Залиште вікно для номера рами</h3>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Не заклеюйте наглухо каретковий вузол (знизу між педалями). Там вибитий серійний номер, який оглядають
                    прикордонники. Залиште його доступним для швидкої перевірки ліхтариком.
                  </p>
                </li>
              </ol>
            </section>

            <section aria-labelledby="customs-heading" className="border-t border-border-strong pt-10">
              <h2 id="customs-heading" className="type-h2">
                Митні правила: Україна ↔ Польща та Німеччина
              </h2>
              <div className="mt-6 space-y-6">
                <div className="bg-card p-6 border border-border">
                  <h3 className="type-h3">Виїзд з України до ЄС (Польща / Німеччина)</h3>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Згідно зі <strong>статтею 370 Митного кодексу України</strong>, власний вживаний велосипед пасажира належить
                    до категорії особистих речей (спортивне спорядження). Він не підлягає письмовому декларуванню та вивозиться
                    без сплати митних платежів. Польська митниця також пропускає особистий вживаний велосипед як <em>bagaż osobisty</em>.
                  </p>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Якщо ви везете <strong>новий велосипед у заводській коробці як товар</strong>, на польському кордоні діє норма наземного
                    безмитного ввезення до 300 € на особу. Для дорожчих моделей може знадобитися декларування та сплата мита й польського ПДВ (VAT 23%).
                  </p>
                </div>

                <div className="bg-card p-6 border border-border">
                  <h3 className="type-h3">Ввезення велосипеда в Україну з Німеччини</h3>
                  <p className="mt-2 type-body-small text-muted-foreground">
                    Правила ввезення регулюються <strong>статтями 370 та 374 Митного кодексу України</strong> й залежать від статусу речі:
                  </p>
                  <ul className="mt-2 list-disc pl-5 type-body-small text-muted-foreground space-y-1">
                    <li>
                      <strong>Власний уживаний велосипед</strong>, який раніше вивозився з України як особиста річ: ввозиться назад без оподаткування (ст. 370 МКУ) за наявності підтвердження попереднього володіння/користування.
                    </li>
                    <li>
                      <strong>Придбаний у Європі велосипед</strong> (ст. 374 МКУ): у пунктах пропуску для автомобільного сполучення без мита пропускаються товари вартістю <strong>до 500 євро</strong> та вагою <strong>до 50 кг</strong> на одну людину.
                    </li>
                    <li>
                      <strong>Кваліфікаційне правило 24/72 години (ч. 6 ст. 374 МКУ)</strong>: ліміт 500 € / 50 кг діє виключно за умови, що пасажир перебував за кордоном <strong>понад 24 години</strong> та в’їжджає в Україну <strong>не частіше одного разу протягом 72 годин</strong>. Якщо поїздка тривала менше 24 годин або в’їзд відбувається частіше одного разу на 72 години, базою оподаткування є частина вартості, що перевищує <strong>50 євро</strong> (у межах тих самих 500 € / 50 кг).
                    </li>
                    <li>
                      <strong>Підтвердження вартості</strong>: обов’язково майте із собою <strong>касовий чек магазину</strong> (<em>Rechnung</em>) або офіційний <strong>договір купівлі-продажу</strong> (<em>Kaufvertrag</em>) із зазначенням номера рами та фактичної ціни.
                    </li>
                    <li>
                      <strong>Розрахунок платежів при перевищенні ліміту</strong>: митні платежі сплачуються <em>лише з суми перевищення</em>: мито 10% + ПДВ 20% від вартості товару разом із митом.
                    </li>
                  </ul>
                  <p className="mt-3 type-caption text-muted-foreground">
                    Офіційні роз’яснення митних правил:{" "}
                    <a
                      href="https://customs.gov.ua/informatsiia-dlia-gromadian"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="link-underline"
                    >
                      Державна митна служба України — Інформація для громадян ↗
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded border border-warning/40 bg-warning/10 p-5">
                <p className="font-semibold text-foreground">Зверніть увагу щодо електровелосипедів (E-bikes):</p>
                <p className="mt-2 type-body-small text-muted-foreground">
                  Перевезення електробайків наразі відкладено через особливості пожежної безпеки літієвих акумуляторів високої
                  ємності в багажному відділенні та додаткові вимоги до їхнього митного оформлення. Звичайні механічні велосипеди
                  перевозяться в багажному відділенні за умови попереднього погодження наявності вільного місця з перевізником та дотримання митних лімітів.
                </p>
              </div>
            </section>

            <section aria-labelledby="theft-check-heading" className="border-t border-border-strong pt-10">
              <h2 id="theft-check-heading" className="type-h2">
                Перевірка серійного номера рами (контроль Straż Graniczna та SIS)
              </h2>
              <p className="mt-4 type-body text-muted-foreground">
                Під час прикордонного та митного контролю (зокрема польською прикордонною службою Straż Graniczna) посадові особи
                мають право звіряти серійний номер рами (<em>Rahmennummer</em>, вибитий знизу на каретковому вузлі)
                із реєстрами розшукуваного майна, такими як Шенгенська інформаційна система (SIS).
              </p>
              <ul className="mt-4 list-disc pl-5 type-body text-muted-foreground space-y-2">
                <li><strong>Пошкоджені або зафарбовані номери:</strong> велосипед із нечитабельним, спиляним або видозміненим серійним номером може привернути підвищену увагу контролюючих органів або бути затриманий для додаткової перевірки обставин (ризик кваліфікації за статтями про скупку краденого майна — <em>paserstwo</em>).</li>
                <li><strong>Підтверджуючі документи:</strong> зберігайте при собі паспорт велосипеда (з відміткою магазину), чек, рахунок-фактуру або договір купівлі-продажу.</li>
                <li><strong>Перевірте велосипед перед придбанням у ЄС:</strong> якщо ви купуєте вживаний байк на майданчиках у Німеччині (Kleinanzeigen тощо), обов’язково вимагайте від продавця підписання договору купівлі-продажу із зазначенням його посвідчення особи (Personalausweis).</li>
              </ul>
            </section>

            <section aria-labelledby="parcel-heading" className="border-t border-border-strong pt-10">
              <h2 id="parcel-heading" className="type-h2">
                Відправлення велосипеда як посилки (без пасажира)
              </h2>
              <p className="mt-4 type-body text-muted-foreground">
                Якщо велосипед відправляється окремо від поїздки пасажира (несупроводжуваний вантаж або посилка):
              </p>
              <ul className="mt-3 list-disc pl-5 type-body-small text-muted-foreground space-y-2">
                <li><strong>Митний ліміт для посилок (ст. 234 МКУ):</strong> для товарів у міжнародних поштових та експрес-відправленнях на одного одержувача безмитний поріг становить <strong>до 150 євро</strong>. При вартості понад 150 € нараховується мито 10% і ПДВ 20% на суму перевищення.</li>
                <li>Підготуйте копії паспортів відправника та одержувача.</li>
                <li>Додайте документи про походження велосипеда (чек, паспорт або договір).</li>
                <li>Обов’язково узгодьте з перевізником статус відправлення (несупроводжувана посилка), точну дату рейсу та адресу передачі у місті відправлення.</li>
              </ul>
            </section>

            <section aria-labelledby="faq-section-heading" className="border-t border-border-strong pt-10">
              <h2 id="faq-section-heading" className="type-h2">
                Поширені запитання про перевезення велосипеда
              </h2>
              <div className="mt-6">
                <Faq items={faqItems} />
              </div>
            </section>

            <section aria-labelledby="hubs-guide-heading" className="border-t border-border-strong pt-10">
              <h2 id="hubs-guide-heading" className="type-h2">
                Міста посадки та сполучення UARoute
              </h2>
              <p className="mt-4 type-body-small text-muted-foreground">
                Ви можете узгодити поїздку з велосипедом із ключових українських та німецьких транспортних хабів:
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/cities/lviv/" className="border border-border px-4 py-2 type-body-small hover:bg-secondary">
                  Хаб Львів ↗
                </Link>
                <Link href="/cities/ivano-frankivsk/" className="border border-border px-4 py-2 type-body-small hover:bg-secondary">
                  Хаб Івано-Франківськ ↗
                </Link>
                <Link href="/cities/stryi/" className="border border-border px-4 py-2 type-body-small hover:bg-secondary">
                  Хаб Стрий ↗
                </Link>
                <Link href="/cities/celle/" className="border border-border px-4 py-2 type-body-small hover:bg-secondary">
                  Хаб Целле (Німеччина) ↗
                </Link>
                <Link href="/routes/" className="border border-border px-4 py-2 type-body-small hover:bg-secondary">
                  Усі комерційні маршрути ↗
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
            <div className="border border-border-strong bg-card p-6">
              <p className="type-label text-muted-foreground">Звернення щодо перевезення</p>
              <h2 className="mt-3 type-h2">Уточніть умови з перевізником</h2>
              <p className="mt-3 type-body-small text-muted-foreground">
                Перевізник «Коваль» здійснює пасажирські рейси та доставку посилок мікроавтобусами Mercedes Sprinter.
                Узгодьте дату, наявність вільного об’єму в багажнику та вартість безпосередньо з водієм через WhatsApp.
              </p>

              <div className="mt-6">
                <BicycleInquiryCta whatsappNumber={whatsappNumber} className="w-full" />
              </div>

              <p className="mt-4 type-caption text-muted-foreground">
                Звернення є попереднім запитом і не зобов’язує до оплати. UARoute не зберігає особисті дані та передає
                ваш запит напряму перевізнику.
              </p>
            </div>

            {koval ? (
              <PartnerCard
                carrier={publicCarrier(koval)}
                ctaLocation="partner_card"
                inquiryOnly={true}
              />
            ) : null}
          </aside>
        </div>
      </article>
    </>
  );
}
