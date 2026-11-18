import { absoluteUrl, siteConfig } from "@/config/site";
import { getCityHubContent } from "@/data/city-hubs";
import { cities } from "@/data/cities";
import { cityHubPaths } from "@/data/discovery";
import { listResolvedRoutes } from "@/data/queries";

const priorityHubPaths = new Set(["/cities/lviv/", "/cities/ivano-frankivsk/"]);
const priorityRouteSlugs = new Set([
  "lviv-hannover",
  "lviv-celle",
  "celle-lviv",
  "ivano-frankivsk-wolfsburg",
  "wolfsburg-ivano-frankivsk",
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
    "UARoute допомагає обрати напрямок і підготувати звернення. Перевізник підтверджує можливість поїздки та оформлює бронювання.",
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
    ...hubs.map((path) => {
      const city = cities.find(({ slug }) => path === `/cities/${slug}/`);
      const hub = city && getCityHubContent(city.id);
      if (!hub) throw new Error(`Missing published city hub content for ${path}`);
      return link(hub.cityName, path, hub.description);
    }),
  ].join("\n"));

  sections.push([
    full ? "## Опубліковані напрямки для звернень" : "## Вибрані напрямки для звернень",
    "",
    ...routes.map((route) => link(
      route.title,
      `/routes/${route.slug}/`,
      full ? route.description : "Деталі напрямку та звернення до перевізника.",
    )),
  ].join("\n"));

  if (!full) {
    sections.push([
      "## Повний довідник",
      "",
      link("Довідник UARoute для ШІ", "/llms-full.txt", "Порядок звернення, довідники міст і всі опубліковані напрямки для звернень."),
    ].join("\n"));
  }

  return `${sections.join("\n\n")}\n`;
}
