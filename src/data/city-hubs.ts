import type { FaqItem } from "./types";

export type NearbyPlaceContext = {
  /** Stable key within this content record; not a city id, URL, or analytics value. */
  readonly contentKey: string;
  readonly name: string;
  readonly localName?: string;
  readonly guidance: string;
  readonly geographySource: {
    readonly url: string;
    readonly checkedAt: string;
  };
};

export type CityPlanningResource = {
  readonly label: string;
  readonly url: string;
  readonly checkedAt: string;
  readonly purpose: string;
};

export type CityHubContent = {
  readonly cityId: string;
  readonly cityName: string;
  readonly fromName: string;
  readonly toName: string;
  readonly title: string;
  readonly heading: string;
  readonly description: string;
  readonly intro: string;
  readonly outbound: string;
  readonly returning: string;
  readonly faq: readonly Readonly<FaqItem>[];
  readonly routeSlugs: readonly string[];
  readonly nearbyHeading: string;
  readonly nearbyIntro: string;
  readonly nearbyActionText: string;
  readonly nearbyPlaces: readonly NearbyPlaceContext[];
  readonly planningResources: readonly CityPlanningResource[];
  readonly contentReview: {
    readonly reviewedAt: string;
    readonly contentUpdatedAt: string;
    readonly reviewScope: "editorial_guidance";
  };
};

export const cityHubContents = [
  {
    cityId: "lviv",
    cityName: "Львів",
    fromName: "зі Львова",
    toName: "до Львова",
    title: "Поїздки зі Львова до Німеччини та назад | UARoute",
    heading: "Поїздки зі Львова до Німеччини та назад",
    description: "Поїздки зі Львова до Німеччини та назад: вибір міста, поради про місце зустрічі, доїзд до посадки й подальшу дорогу. Уточніть умови у перевізника Коваль.",
    intro: "UARoute допомагає знайти напрямок зі Львова до потрібного міста Німеччини або назад і підготувати звернення до перевізника Коваль. Оберіть місто, щоб перейти до порад для вашої поїздки або скласти запит.",
    outbound: "Якщо спочатку добираєтеся до Львова, повідомте перевізнику, звідки й коли плануєте прибути. Погодьте точку та час зустрічі, перш ніж купувати квиток на попередню ділянку. Для пересування містом звірте актуальні правила місцевого транспорту в офіційному довіднику нижче. Довідник не визначає місце посадки Коваль.",
    returning: "Для виїзду з Німеччини додайте адресу або район зустрічі й погодьте місце висадки у Львові. Якщо звідти їдете далі, уточніть очікуваний час прибуття та запас перед наступною поїздкою. Не вважайте залізничний вокзал чи інший орієнтир автоматично погодженою зупинкою.",
    faq: [
      { question: "Що написати, якщо до Львова ще потрібно доїхати?", answer: "Повідомте, звідки добираєтеся та коли плануєте бути у Львові. Погодьте місце й час зустрічі, перш ніж купувати квитки на попередню ділянку шляху." },
      { question: "Як запитати про пересадку під час поїздки?", answer: "Якщо пересадка впливає на ваші плани, запитайте перевізника, чи передбачена вона для конкретної поїздки та як бути з багажем. Умови потрібно погодити окремо." },
      { question: "Чи потрібно одразу знати дату повернення?", answer: "Можна підготувати звернення лише для виїзду. Коли визначите дату повернення, перемкніть пошук на «До України» й складіть окреме повідомлення. Якщо хочете обговорити обидві поїздки одразу, додайте дату повернення в текст WhatsApp." },
      { question: "Що запитати, якщо подорожую з дитиною?", answer: "Укажіть вік дитини й запитайте про вартість, дитяче крісло, багаж та потрібні для перевезення умови. Перевізник має підтвердити, що можна організувати саме для вашої поїздки." },
    ],
    routeSlugs: ["lviv-hannover", "lviv-celle", "celle-lviv"],
    nearbyHeading: "Якщо ви живете неподалік",
    nearbyIntro: "Якщо ви живете поруч і розглядаєте зустріч у Львові, у пошуку виберіть Львів і потрібне місто в Німеччині. У приватному повідомленні WhatsApp назвіть своє фактичне місце й погодьте точку зустрічі та умови поїздки. Вибір Львова сам собою не означає посадку у вашому населеному пункті.",
    nearbyActionText: "Повернутися до пошуку поїздки",
    nearbyPlaces: [],
    planningResources: [{ label: "Офіційний довідник громадського транспорту Львова", url: "https://lviv.travel/ua/news/gaid-lvivskim-gromadskim-transportom", checkedAt: "2026-10-09", purpose: "Перевірити актуальні правила доїзду в місті." }],
    contentReview: { reviewedAt: "2026-10-09", contentUpdatedAt: "2026-10-09", reviewScope: "editorial_guidance" },
  },
  {
    cityId: "ivano-frankivsk",
    cityName: "Івано-Франківськ",
    fromName: "з Івано-Франківська",
    toName: "до Івано-Франківська",
    title: "Поїздки з Івано-Франківська до Німеччини та назад | UARoute",
    heading: "Поїздки з Івано-Франківська до Німеччини та назад",
    description: "Івано-Франківськ ↔ Німеччина: оберіть місто й перегляньте поради про посадку, багаж та зустріч після прибуття. Погодьте поїздку з перевізником Коваль.",
    intro: "UARoute допомагає знайти напрямок з Івано-Франківська до потрібного міста Німеччини або назад і підготувати звернення до перевізника Коваль. Оберіть місто й продумайте місце зустрічі, багаж та дорогу після прибуття.",
    outbound: "Опишіть зручний район або орієнтир зустрічі в Івано-Франківську та повідомте, якщо добираєтеся з іншого населеного пункту. Запитайте про точне місце й час, кількість валіз і великий багаж. Якщо до міста плануєте їхати потягом, перевірте варіанти в офіційному сервісі Укрзалізниці після погодження зустрічі.",
    returning: "Погодьте місце висадки в Івано-Франківську й спосіб отримати повідомлення про зміну часу прибуття. Якщо вас зустрічають, передайте їм погоджені деталі. Для подальшої поїздки потягом перевірте доступні варіанти окремо; пересування містом і стиковка не гарантуються зверненням до Коваль.",
    faq: [
      { question: "Як зазначити дату, якщо можу виїхати в різні дні?", answer: "Виберіть бажану дату у формі, а в повідомленні WhatsApp додайте інші дні, які вам підходять. Запитайте перевізника, на яку з цих дат можна погодити поїздку." },
      { question: "Як запитати про пересадку під час поїздки?", answer: "Якщо пересадка впливає на ваші плани, запитайте перевізника, чи передбачена вона для конкретної поїздки та як бути з багажем. Умови потрібно погодити окремо." },
      { question: "Як описати великий багаж?", answer: "Напишіть кількість валіз і приблизні розміри великої речі. Запитайте, чи можна взяти її з собою та скільки коштуватиме перевезення. Погодьте ці умови до виїзду." },
      { question: "Як спланувати зустріч після повернення до Івано-Франківська?", answer: "Погодьте місце висадки й очікуваний час прибуття. Запитайте, як дізнатися про зміну часу в дорозі, та передайте ці деталі тим, хто вас зустрічає." },
    ],
    routeSlugs: ["ivano-frankivsk-wolfsburg", "wolfsburg-ivano-frankivsk"],
    nearbyHeading: "Якщо ви живете неподалік",
    nearbyIntro: "Якщо ви живете поруч і розглядаєте зустріч в Івано-Франківську, у пошуку виберіть Івано-Франківськ і потрібне місто в Німеччині. У приватному повідомленні WhatsApp назвіть своє фактичне місце й погодьте точку зустрічі та умови поїздки. Вибір Івано-Франківська сам собою не означає посадку у вашому населеному пункті.",
    nearbyActionText: "Повернутися до пошуку поїздки",
    nearbyPlaces: [],
    planningResources: [{ label: "Офіційний пошук квитків Укрзалізниці", url: "https://booking.uz.gov.ua/", checkedAt: "2026-10-09", purpose: "Окремо перевірити потрібну попередню або подальшу ділянку." }],
    contentReview: { reviewedAt: "2026-10-09", contentUpdatedAt: "2026-10-09", reviewScope: "editorial_guidance" },
  },
  {
    cityId: "celle",
    cityName: "Целле",
    fromName: "із Целле",
    toName: "до Целле",
    title: "Поїздки з Целле до України та назад | UARoute",
    heading: "Поїздки з Целле до України та назад",
    description: "Оберіть українське місто для поїздки з Целле або назад. Поради про зустріч, багаж і подальшу дорогу; умови підтверджує перевізник Коваль.",
    intro: "UARoute допомагає знайти напрямок з Целле та навколишніх населених пунктів до України або назад і підготувати звернення до перевізника Коваль. Оберіть українське місто для пошуку.",
    outbound: "Якщо вирушаєте з Целле або сусіднього населеного пункту, якого немає в пошуку, оберіть Целле як найближче доступне в пошуку місто, коли воно відповідає вашому плану. У приватному повідомленні вкажіть фактичне місце й точну адресу або орієнтир, а також повідомте про багаж. Якщо їдете до зустрічі в Целле, уточніть місце й час до купівлі квитків на місцеву дорогу.",
    returning: "Якщо вам потрібно приїхати до Целле чи сусіднього населеного пункту, оберіть напрямок до Целле в пошуку, коли окремого місця немає серед варіантів. У приватному повідомленні вкажіть фактичне місце прибуття, адресу або орієнтир. Повідомте тих, хто вас зустрічатиме, і окремо сплануйте місцеву дорогу після прибуття.",
    faq: [
      { question: "Як погодити місце зустрічі в Целле?", answer: "Напишіть, який район або орієнтир вам зручний, і запитайте про точне місце та час зустрічі. Якщо після прибуття вас зустрічають, передайте їм погоджені деталі." },
      { question: "Що вибрати, якщо мого населеного пункту немає в пошуку?", answer: "Якщо Целле — найближче доступне в пошуку місто для вашого плану, оберіть його. У приватному повідомленні назвіть фактичний населений пункт і точну адресу або орієнтир." },
      { question: "Що запитати про багаж або пересадку?", answer: "Повідомте кількість валіз і опишіть великі речі. Якщо пересадка впливає на ваші плани, запитайте, чи передбачена вона для конкретної поїздки та як узгодити багаж." },
      { question: "Як спланувати подальшу дорогу після прибуття?", answer: "Заздалегідь повідомте людині, яка вас зустрічатиме, фактичне місце й очікуваний час. Місцевий транспорт або іншу подальшу дорогу перевірте окремо та залиште запас часу." },
    ],
    routeSlugs: ["celle-lviv", "lviv-celle", "celle-dolyna", "dolyna-celle"],
    nearbyHeading: "Населені пункти поблизу Целле",
    nearbyIntro: "Якщо вашого населеного пункту немає серед варіантів пошуку і Целле — найближче доступне для вашої поїздки місто в пошуку, оберіть його. У приватному повідомленні назвіть фактичний населений пункт і точну адресу або орієнтир. Коваль окремо підтвердить, чи можлива там посадка або висадка для конкретної поїздки.",
    nearbyActionText: "Повернутися до пошуку поїздки",
    nearbyPlaces: [
      {
        contentKey: "celle-lachendorf-area",
        name: "Лахендорф і сусідні громади",
        localName: "Samtgemeinde Lachendorf",
        guidance: "Для Lachendorf, Ahnsbeck, Beedenbostel, Eldingen або Hohne напишіть німецьку назву населеного пункту та повну адресу з поштовим індексом. Це допоможе точно визначити вашу фактичну точку виїзду.",
        geographySource: { url: "https://www.lachendorf.de/Samtgemeinde-Lachendorf/?La=1", checkedAt: "2026-10-10" },
      },
      {
        contentKey: "celle-hambuehren-area",
        name: "Гамбурен та навколишні поселення",
        localName: "Hambühren",
        guidance: "Якщо адреса в Hambühren, Hambühren I, Hambühren II, Oldau, Ovelgönne або Schönhop, зазначте саме цю назву та вулицю. Для Hambühren I і II напишіть також номер частини, щоб не сплутати адресу.",
        geographySource: { url: "https://www.hambuehren.de/portal/seiten/geschichte-905000004-20571.html", checkedAt: "2026-10-10" },
      },
      {
        contentKey: "celle-winsen-aller-area",
        name: "Вінзен (Аллер) та поселення громади",
        localName: "Winsen (Aller)",
        guidance: "Для Winsen (Aller), Bannetze, Meißendorf, Stedden, Südwinsen, Thören, Walle або Wolthausen напишіть назву пункту та адресу. Якщо вас зустрічатимуть, передайте цю адресу людині заздалегідь.",
        geographySource: { url: "https://winsen-aller.de/fileadmin/user_upload/Downloads/Ortsrecht/2022-01-21-101-I-Hauptsatzung-Fassung-12-2021.pdf", checkedAt: "2026-10-10" },
      },
      {
        contentKey: "celle-wietze-area",
        name: "Вітце та сусідні поселення",
        localName: "Wietze",
        guidance: "Для Wietze, Steinförde, Wieckenberg, Jeversen або Hornbostel вкажіть німецьке написання назви й повну адресу. Так буде зрозуміло, яке саме місце ви маєте на увазі.",
        geographySource: { url: "https://www.wietze.de/unser-wietze/ortsportrait/", checkedAt: "2026-10-10" },
      },
      {
        contentKey: "celle-flotwedel-area",
        name: "Громади й поселення Флотведеля",
        localName: "Samtgemeinde Flotwedel",
        guidance: "Для Wienhausen, Eicklingen, Langlingen, Bröckel, Offensen, Oppershausen, Bockelskamp або Nienhof зазначте конкретне поселення й повну адресу. Перевірте місцевий доїзд до чи від цієї точки окремо.",
        geographySource: { url: "https://www.flotwedel.de/downloads/datei/YmY3ZTdhMjczMDUzMDFmNkE0VUI3OU1vS2pXeHJlQVNqQXhESEZLTzdSSFp1NDIzZTJwZjBZNGwrbmZ0NW1XUXRqdHJqYlgxcEN4TFJjcVFnUGhXVHFQY2swTjlCTVd5K1BHc2Zvc1MyOWYwUDhma1c3dmIrV1RFSzk2M0pINE1LVmJpVVdyd2oraWl1RDlxYVJianpGOENrMkVjUHU5TFVZOUFTbWRCSldreGhtS2NUNmwrK3d1bU53cz0", checkedAt: "2026-10-10" },
      },
    ],
    planningResources: [{ label: "Офіційний довідник доїзду до Целле", url: "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken", checkedAt: "2026-10-09", purpose: "Перевірити місцевий доїзд перед зустріччю або подальшою дорогою." }],
    contentReview: { reviewedAt: "2026-10-10", contentUpdatedAt: "2026-10-10", reviewScope: "editorial_guidance" },
  },
] as const satisfies readonly CityHubContent[];

export function getCityHubContent(cityId: string): CityHubContent | undefined {
  return cityHubContents.find((content) => content.cityId === cityId);
}
