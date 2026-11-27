import { absoluteUrl, siteConfig } from "@/config/site";
import { getCityHubContent } from "@/data/city-hubs";
import { cities } from "@/data/cities";
import { cityHubPaths } from "@/data/discovery";
import { listResolvedRoutes } from "@/data/queries";

const priorityHubPaths = new Set(["/cities/lviv/", "/cities/ivano-frankivsk/", "/cities/hannover/"]);
const priorityRouteSlugs = new Set([
  "lviv-hannover",
  "lviv-celle",
  "celle-lviv",
  "ivano-frankivsk-wolfsburg",
  "wolfsburg-ivano-frankivsk",
  "ivano-frankivsk-hannover",
  "hannover-ivano-frankivsk",
]);

function link(label: string, path: string, description: string) {
  return `- [${label}](${absoluteUrl(path)}): ${description}`;
}

export function llmsContent(full: boolean) {
  const hubs = cityHubPaths.filter((path) => full || priorityHubPaths.has(path));
  const routes = listResolvedRoutes("commercial").filter(
    (route) => full || priorityRouteSlugs.has(route.slug),
  );

  const sections = [
    `# ${siteConfig.name}`,
    `> ${siteConfig.description}`,
    "UARoute допомагає обрати міста для запиту перевізнику між Україною (зокрема Львів, Івано-Франківськ, Калуш, Стрий, Долина) та Німеччиною (зокрема Ганновер, Целле, Вольфсбург, Брауншвейг, Люнебург). За інформацією перевізника, поїздки виконуються мікроавтобусами Mercedes Sprinter з двома водіями, діє адресна доставка пасажирів у Німеччині та бронювання без передоплати; можливість конкретної поїздки, посадку, висадку й умови підтверджує перевізник.",
  ];

  if (full) {
    sections.push([
      "## Як підготувати звернення",
      "",
      "1. У пошуку виберіть місто відправлення та місто прибуття. Для зворотної поїздки поміняйте їх місцями.",
      "2. Якщо потрібного населеного пункту немає в пошуку, виберіть найближче доступне місто. У приватному зверненні назвіть фактичний населений пункт, район або адресу. Погодьте з перевізником, чи можлива посадка або висадка в потрібному місці.",
      "3. Уточніть у перевізника можливість поїздки на потрібну дату, наявність місць, час, місця посадки й висадки, повну вартість і умови щодо багажу. Дочекайтеся підтвердження від перевізника перед тим, як планувати подальшу дорогу.",
    ].join("\n"));
  }

  sections.push([
    "## Планування поїздки",
    "",
    link("Пошук напрямків", "/routes/", "Вибір міст відправлення й прибуття та перехід до звернення."),
    link("Про UARoute", "/about/", "Як UARoute допомагає підготувати звернення до перевізника."),
    link("Велосипед у поїздці", "/guides/perevezennya-velosypeda/", "Що уточнити про перевезення велосипеда й пакування."),
  ].join("\n"));

  sections.push([
    "## Довідники міст",
    "",
    ...hubs.flatMap((path) => {
      const city = cities.find(({ slug }) => path === `/cities/${slug}/`);
      const hub = city && getCityHubContent(city.id);
      if (!hub) throw new Error(`Missing published city hub content for ${path}`);
      if (!full) return [link(hub.cityName, path, hub.description)];
      const nearby = hub.nearbyPlaces.map((place) => place.localName ? `${place.name} (${place.localName})` : place.name).join(", ");
      const faqLines = hub.faq.slice(0, 2).map((item) => `  - ${item.question} ${item.answer}`);
      return [
        link(hub.cityName, path, hub.description),
        ...(nearby ? [`  - Населені пункти поруч (назвіть фактичне місце в приватному зверненні): ${nearby}.`] : []),
        ...faqLines,
      ];
    }),
  ].join("\n"));

  sections.push([
    full ? "## Опубліковані напрямки для звернень" : "## Вибрані напрямки для звернень",
    "",
    ...routes.map((route) => {
      if (!full) {
        return link(route.title, `/routes/${route.slug}/`, "Деталі напрямку та звернення до перевізника.");
      }
      const corridor = route.corridor.join(" — ");
      const confirm = route.whatToConfirm.join(" ");
      return link(route.title, `/routes/${route.slug}/`, `${route.description} Коридор: ${corridor}. Перед поїздкою уточніть: ${confirm}`);
    }),
  ].join("\n"));

  if (full) {
    sections.push([
      "## Інформація про оператора та приватність",
      "",
      link("Відомості про оператора", "/imprint/", "Оператор UARoute (Roman Senchuk, польська JDG, бренд Crew Bravo) та роль перевізника."),
      link("Приватність і файли cookie", "/privacy/", "Обробка даних форми, передавання до WhatsApp, необов’язкова аналітика та права користувачів."),
    ].join("\n"));
  } else {
    sections.push([
      "## Повний довідник",
      "",
      link("Довідник UARoute для ШІ", "/llms-full.txt", "Порядок звернення, довідники міст і всі опубліковані напрямки для звернень."),
    ].join("\n"));
  }

  return `${sections.join("\n\n")}\n`;
}
