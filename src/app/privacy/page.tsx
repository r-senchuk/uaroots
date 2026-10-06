import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { business } from "@/config/business";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Приватність запитів і аналітики | UARoute",
  description: "Що відбувається з датою та телефоном у формі UARoute, як відкривається WhatsApp і як обрати необов’язкову аналітику.",
  path: "/privacy/",
});

export default function PrivacyPage() {
  return (
    <div className="container-page py-10 sm:py-16">
      <Breadcrumbs items={[{ name: "Головна", path: "/" }, { name: "Приватність", path: "/privacy/" }]} />
      <h1 className="mt-10 max-w-3xl type-display">Приватність</h1>
      <p className="mt-5 type-caption">Оновлено 6 жовтня 2026 року</p>
      <div className="mt-10 max-w-2xl space-y-8 type-body">
        <section>
          <h2 className="type-h2">Оператор сайту</h2>
          <p className="mt-4">UARoute працює в межах польської JDG {business.operatorName}, під бізнес-брендом Crew Bravo. <Link href="/imprint/" className="link-underline">Контактні відомості оператора</Link>.</p>
        </section>
        <section>
          <h2 className="type-h2">Ваш запит у WhatsApp</h2>
          <p className="mt-4">Місто відправлення, місто призначення, дата, телефон і кількість пасажирів потрібні для підготовки повідомлення перевізнику Коваль. UARoute тримає введені дані лише в пам’яті відкритої форми та не записує їх у базу клієнтів, файли cookie або сховище браузера.</p>
          <p className="mt-3">Натиснувши кнопку WhatsApp, ви відкриваєте зовнішній сервіс із підготовленим текстом. Посилання передає цей текст сервісу WhatsApp; перевірте його та самостійно надішліть повідомлення. Після надсилання повідомлення надходить перевізнику Коваль для перевірки можливості поїздки та погодження умов.</p>
          <p className="mt-3">Подальше листування й обробка даних у перевізника та WhatsApp відбуваються поза сайтом UARoute. Правила зберігання повідомлень і контактів у перевізника Коваль можна уточнити у перевізника. <a className="link-underline" href="https://www.whatsapp.com/legal/privacy-policy-eea" target="_blank" rel="noopener noreferrer">Політика приватності WhatsApp ↗</a>.</p>
        </section>
        <section>
          <h2 className="type-h2">Позначення джерела запиту</h2>
          <p className="mt-4">Повідомлення містить позначку UARoute та випадковий код запиту. Вони допомагають перевізнику повідомити, чи звернення завершилося поїздкою, без передавання нам імені, телефону чи тексту листування.</p>
          <p className="mt-3">Під час переходу на сайт Коваль посилання може містити позначку джерела, код і міста маршруту. Номер телефону та обрана дата в таке посилання не додаються. Підготовлене повідомлення й відкриття WhatsApp самі по собі не підтверджують надсилання або бронювання.</p>
        </section>
        <section>
          <h2 className="type-h2">Необов’язкова аналітика</h2>
          <p className="mt-4">Якщо аналітику відвідувань увімкнено на сайті, Google Analytics завантажується лише після вашого дозволу. Можна відмовитися або змінити вибір унизу сторінки. Пошук і звернення працюють без цього дозволу.</p>
          <p className="mt-3">Аналітика може отримувати відомості про переглянутий напрямок, джерело переходу, натискання контакту, кількість пасажирів і випадковий код. Ми не передаємо їй ім’я, телефон, обрану дату поїздки або текст повідомлення. Google може обробляти технічні дані браузера та мережі відповідно до <a className="link-underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">своєї політики ↗</a>.</p>
          <p className="mt-3">UARoute записує у сховище браузера ваш вибір аналітики до його зміни або очищення сховища. Після дозволу Google Analytics може використовувати аналітичні файли cookie; їх можна видалити в налаштуваннях браузера. Хостинг сайту може обробляти технічні відомості запитів для роботи та захисту сервісу.</p>
        </section>
        <section>
          <h2 className="type-h2">Питання щодо даних</h2>
          <p className="mt-4">Для питань про обробку даних на UARoute або реалізацію ваших прав звертайтеся до <a className="link-underline" href={`mailto:${business.email}`}>{business.email}</a>. Якщо питання стосується повідомлення, яке ви надіслали перевізнику Коваль, зверніться також безпосередньо до перевізника.</p>
        </section>
      </div>
    </div>
  );
}
