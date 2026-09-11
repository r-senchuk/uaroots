import type { Route } from "./types";

/**
 * Data-integrity rule: no route may state trip duration, timetable, stops,
 * distance, departure times, price, availability or ratings. Anything not
 * verified belongs in `whatToConfirm` as a question for the carrier.
 *
 * status: "commercial" routes are indexed and listed in /routes and the sitemap.
 * "editorial" routes are corridors we can describe but whose bookable status has
 * not been confirmed with the carrier — they are excluded from the index and sitemap.
 */
export const routes: Route[] = [
  {
    id: "lviv-hannover",
    slug: "lviv-hannover",
    status: "commercial",
    originCityId: "lviv",
    destinationCityId: "hannover",
    title: "Львів → Ганновер",
    description:
      "Поїздка зі Львова до Ганновера — напрямок із України до Нижньої Саксонії. Тут зібрано те, що варто знати перед поїздкою, і те, що потрібно уточнити безпосередньо у перевізника.",
    corridor: ["Україна", "Польща", "Німеччина"],
    carrierIds: ["koval"],
    deskId: "koval-de",
    relatedRouteIds: ["lviv-hamburg", "lviv-berlin"],
    seo: {
      title: "Львів → Ганновер: як доїхати та що уточнити | UARoute",
      description:
        "Маршрут Львів → Ганновер: маршрутний коридор, хто виконує перевезення, що варто уточнити у перевізника та як надіслати запит у WhatsApp.",
    },
    faq: [
      {
        question: "Хто виконує перевезення на цьому напрямку?",
        answer:
          "Перевезення виконує Koval (KOVAL 4K). UARoute не є перевізником: ми допомагаємо знайти маршрут і підготувати запит до перевізника.",
      },
      {
        question: "Чи означає повідомлення у WhatsApp підтверджене бронювання?",
        answer:
          "Ні. Повідомлення у WhatsApp — це заявка на поїздку. Місце, час і вартість підтверджує перевізник у розмові з вами.",
      },
      {
        question: "Які дані потрібні, щоб надіслати запит?",
        answer:
          "Дата поїздки, номер телефону для зв'язку та кількість пасажирів. Маршрут підставляється автоматично зі сторінки.",
      },
      {
        question: "Чи публікує UARoute розклад і ціни?",
        answer:
          "Ні. Ми не публікуємо розкладів, тривалості поїздки чи цін, доки вони не підтверджені перевізником. Ці деталі варто уточнити у Koval безпосередньо.",
      },
    ],
    whatToConfirm: [
      "Точний час і дату виїзду",
      "Місце посадки у Львові та місце висадки в Ганновері",
      "Вартість поїздки та спосіб оплати",
      "Умови та обмеження щодо багажу",
      "Можливість адресної подачі або довезення",
      "Документи, які потрібні для перетину кордону",
    ],
  },
  {
    id: "lviv-hamburg",
    slug: "lviv-hamburg",
    status: "editorial",
    originCityId: "lviv",
    destinationCityId: "hamburg",
    title: "Львів → Гамбург",
    description:
      "Напрямок зі Львова до Гамбурга на півночі Німеччини. Комерційний статус цього маршруту ще не підтверджений перевізником — наявність поїздок варто уточнити у Koval.",
    corridor: ["Україна", "Польща", "Німеччина"],
    carrierIds: ["koval"],
    deskId: "koval-de",
    relatedRouteIds: ["lviv-hannover", "lviv-berlin"],
    seo: {
      title: "Львів → Гамбург: напрямок і що уточнити | UARoute",
      description:
        "Напрямок Львів → Гамбург: маршрутний коридор і перелік того, що потрібно уточнити у перевізника перед поїздкою.",
    },
    faq: [
      {
        question: "Чи можна забронювати цей маршрут просто зараз?",
        answer:
          "Ми ще не підтвердили комерційний статус цього напрямку. Найнадійніший спосіб — написати перевізнику й запитати про наявність поїздок на потрібну дату.",
      },
    ],
    whatToConfirm: [
      "Чи виконуються поїздки на цьому напрямку",
      "Точний час і дату виїзду",
      "Місце посадки та висадки",
      "Вартість поїздки та умови багажу",
    ],
  },
  {
    id: "lviv-berlin",
    slug: "lviv-berlin",
    status: "editorial",
    originCityId: "lviv",
    destinationCityId: "berlin",
    title: "Львів → Берлін",
    description:
      "Напрямок зі Львова до Берліна. Комерційний статус цього маршруту ще не підтверджений перевізником — наявність поїздок варто уточнити у Koval.",
    corridor: ["Україна", "Польща", "Німеччина"],
    carrierIds: ["koval"],
    deskId: "koval-de",
    relatedRouteIds: ["lviv-hannover", "lviv-hamburg"],
    seo: {
      title: "Львів → Берлін: напрямок і що уточнити | UARoute",
      description:
        "Напрямок Львів → Берлін: маршрутний коридор і перелік того, що потрібно уточнити у перевізника перед поїздкою.",
    },
    faq: [
      {
        question: "Чи можна забронювати цей маршрут просто зараз?",
        answer:
          "Ми ще не підтвердили комерційний статус цього напрямку. Напишіть перевізнику, щоб дізнатися про наявність поїздок на потрібну дату.",
      },
    ],
    whatToConfirm: [
      "Чи виконуються поїздки на цьому напрямку",
      "Точний час і дату виїзду",
      "Місце посадки та висадки",
      "Вартість поїздки та умови багажу",
    ],
  },
];

export const routesById = new Map(routes.map((route) => [route.id, route]));
export const routesBySlug = new Map(routes.map((route) => [route.slug, route]));

export const commercialRoutes = routes.filter((route) => route.status === "commercial");
export const editorialRoutes = routes.filter((route) => route.status === "editorial");
