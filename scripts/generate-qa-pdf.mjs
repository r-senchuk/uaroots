import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const htmlContent = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<title>UARoute — Інструкція та кейси тестування пасажирського досвіду</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {
      content: counter(page);
      font-size: 9pt;
      color: #666;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #111827;
    background: #fff;
    line-height: 1.5;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }

  h1, h2, h3, h4 {
    color: #0f172a;
    font-weight: 700;
    margin-top: 1.2em;
    margin-bottom: 0.4em;
    page-break-after: avoid;
  }

  h1 {
    font-size: 20pt;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 8px;
    margin-top: 0;
  }

  h2 {
    font-size: 13pt;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px;
    margin-top: 1.5em;
  }

  h3 {
    font-size: 11pt;
    margin-top: 1.1em;
  }

  p {
    margin: 0.5em 0;
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 0.3em;
  }

  .meta-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 18px;
    font-size: 9pt;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
  }

  .badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 8pt;
    font-weight: 600;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .badge-p0 { background: #fee2e2; color: #991b1b; }
  .badge-p1 { background: #fef3c7; color: #92400e; }
  .badge-mode { background: #e0e7ff; color: #3730a3; }

  .callout {
    border-left: 4px solid #3b82f6;
    background: #eff6ff;
    padding: 10px 12px;
    margin: 12px 0;
    font-size: 9.5pt;
    border-radius: 0 4px 4px 0;
    page-break-inside: avoid;
  }

  .callout-alert {
    border-left-color: #ef4444;
    background: #fef2f2;
  }

  .callout-title {
    font-weight: 700;
    margin-bottom: 4px;
    color: #1e3a8a;
  }

  .callout-alert .callout-title {
    color: #991b1b;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 9pt;
    page-break-inside: avoid;
  }

  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background: #f1f5f9;
    font-weight: 600;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  .case-card {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 14px;
    background: #fff;
    page-break-inside: avoid;
  }

  .case-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }

  .case-title {
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .case-badges {
    display: flex;
    gap: 6px;
  }

  .field-label {
    font-weight: 600;
    color: #475569;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-top: 6px;
    margin-bottom: 2px;
  }

  .code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
  }

  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

<h1>UARoute — Інструкція та кейси тестування (QA Package)</h1>

<div class="meta-box">
  <div class="meta-grid">
    <div><strong>Сайт:</strong> https://uaroute.com</div>
    <div><strong>Цільовий реліз:</strong> Production Baseline (b06b38e)</div>
    <div><strong>Призначення:</strong> Ручне тестування та юзабіліті-дослідження</div>
    <div><strong>Дата:</strong> 31 жовтня 2026</div>
  </div>
</div>

<div class="callout callout-alert">
  <div class="callout-title">Головне правило безпеки та конфіденційності (M1 Модель)</div>
  <p><strong>ЖОДНОГО СПАМУ ПЕРЕВІЗНИКУ:</strong> Усі перевірки форми запиту зупиняються на екрані сформованого тексту у WhatsApp. <strong>Кнопку «Надіслати» у WhatsApp не натискати.</strong></p>
  <p><strong>ЗАХИСТ ДАНИХ (Zero PII):</strong> Не вводити справжні персональні номери телефонів чи реальні прізвища пасажирів. UARoute є довідником маршрутів, а не сервісом бронювання, і не зберігає жодних персональних даних пасажирів.</p>
</div>

<h2>Частина 1. Режими тестування (A vs B)</h2>
<p>Для запобігання спотворенню виробничої аналітики та збереження надійності зафіксовано два чіткі режими:</p>

<table>
  <thead>
    <tr>
      <th style="width: 22%;">Режим</th>
      <th style="width: 40%;">Дозволені дії</th>
      <th style="width: 38%;">Суворі обмеження</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Режим A</strong><br><span class="badge badge-mode">Огляд наживо</span></td>
      <td>
        • Перегляд усіх сторінок і каталогів.<br>
        • Пошук міст, вибір підказок, зміна напрямку.<br>
        • Перевірка верстки, шрифтів, меню, адаптивності.<br>
        • Огляд наявності посилань і тексту на 375px/1440px.<br>
        • Фокусування полів введення без відправки.
      </td>
      <td>
        • <strong>НЕ відправляти</strong> форму запиту.<br>
        • <strong>НЕ переходити</strong> у зовнішній WhatsApp.<br>
        • <strong>ОБОВ'ЯЗКОВО</strong> обирати опцію <em>«Без аналітики»</em> у банері згоди при тестуванні на production.
      </td>
    </tr>
    <tr>
      <td><strong>Режим B</strong><br><span class="badge badge-mode">Повний ручний тест</span></td>
      <td>
        • Тестування взаємодії з формою запиту.<br>
        • Валідація дати (минуле, сьогодні, майбутнє).<br>
        • Валідація кількості пасажирів (1–8).<br>
        • Перевірка валідації номерів телефонів.<br>
        • Перехід до клієнта WhatsApp (зупиняючись перед надсиланням).
      </td>
      <td>
        • Використовувати синтетичний телефон (<span class="code">+380000000000</span> або аналогічний тестовий).<br>
        • Не завершувати реальне бронювання квитків.<br>
        • Не повідомляти перевізника про тренувальний статус вручну через чат.
      </td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h2>Частина 2. Протокол юзабіліті-тестування (5–8 нових людей)</h2>
<p>Мета: побачити сайт очима реального пасажира без підказок інженерів і зафіксувати можливі бар'єри розуміння.</p>

<h3>1. Правила проведення для модератора</h3>
<ul>
  <li><strong>Жодних підказок:</strong> Не кажіть, куди клікати, що таке «хаб», чому немає конкретного села.</li>
  <li><strong>Метод «Думай уголос» (Think Aloud):</strong> Заохочуйте учасника озвучувати кожну дію («Я шукаю кнопку...», «Я думаю, що це поїзд...»).</li>
  <li><strong>Фіксація першого хибного кліку:</strong> Запишіть найперше місце, де користувач очікував іншої поведінки сайту.</li>
</ul>

<h3>2. Сценарії завдань для учасників</h3>
<div class="case-card">
  <div class="case-title">Сценарій А: Виїзд із невеликого містечка до Німеччини</div>
  <p><strong>Завдання для користувача:</strong> <em>«Уявіть, що ви живете неподалік Львова (наприклад, у Золочеві чи Яворові) або неподалік Франківська (у Коломиї чи Рогатині) і плануєте поїздку до Німеччини (Ганновер або Вольфсбург). Знайдіть на uaroute.com потрібний напрямок та з'ясуйте, як підготувати запит перевізнику.»</em></p>
  <p><strong>Що перевіряє модератор:</strong> Чи розуміє користувач пораду обрати найближче місто в пошуку, якщо його села немає в базі? Чи не шукає дрібні села в полі вибору?</p>
</div>

<div class="case-card">
  <div class="case-title">Сценарій Б: Повернення з Німеччини в Україну</div>
  <p><strong>Завдання для користувача:</strong> <em>«Уявіть, що ви перебуваєте в Німеччині й хочете повернутися додому до Львова або сусіднього містечка. Знайдіть на uaroute.com зворотний маршрут і підготуйте звернення.»</em></p>
  <p><strong>Що перевіряє модератор:</strong> Чи користується кнопкою реверсу міст? Чи помічає різницю між прямим WhatsApp зверненням та переходом на сайт перевізника?</p>
</div>

<h3>3. Бланк фіксації спостережень (Scorecard на 8 учасників)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 14%;">Пристрій / ОС</th>
      <th style="width: 10%;">Сценарій</th>
      <th style="width: 10%;">Успіх</th>
      <th style="width: 26%;">Перший хибний клік / вагання</th>
      <th style="width: 32%;">Розуміння ролі UARoute vs Перевізник</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>U1</strong></td>
      <td>iPhone / Android</td>
      <td>А / Б</td>
      <td>Так / Ні</td>
      <td></td>
      <td>Зрозуміло / Думає, що це каса продажу</td>
    </tr>
    <tr>
      <td><strong>U2</strong></td>
      <td>iPhone / Android</td>
      <td>А / Б</td>
      <td>Так / Ні</td>
      <td></td>
      <td>Зрозуміло / Думає, що це каса продажу</td>
    </tr>
    <tr>
      <td><strong>U3</strong></td>
      <td>iPhone / Android</td>
      <td>А / Б</td>
      <td>Так / Ні</td>
      <td></td>
      <td>Зрозуміло / Думає, що це каса продажу</td>
    </tr>
    <tr>
      <td><strong>U4</strong></td>
      <td>iPhone / Android</td>
      <td>А / Б</td>
      <td>Так / Ні</td>
      <td></td>
      <td>Зрозуміло / Думає, що це каса продажу</td>
    </tr>
    <tr>
      <td><strong>U5</strong></td>
      <td>iPhone / Android</td>
      <td>А / Б</td>
      <td>Так / Ні</td>
      <td></td>
      <td>Зрозуміло / Думає, що це каса продажу</td>
    </tr>
    <tr>
      <td><strong>U6</strong></td>
      <td>iPhone / Android</td>
      <td>А / Б</td>
      <td>Так / Ні</td>
      <td></td>
      <td>Зрозуміло / Думає, що це каса продажу</td>
    </tr>
    <tr>
      <td><strong>U7</strong></td>
      <td>iPhone / Android</td>
      <td>А / Б</td>
      <td>Так / Ні</td>
      <td></td>
      <td>Зрозуміло / Думає, що це каса продажу</td>
    </tr>
    <tr>
      <td><strong>U8</strong></td>
      <td>iPhone / Android</td>
      <td>А / Б</td>
      <td>Так / Ні</td>
      <td></td>
      <td>Зрозуміло / Думає, що це каса продажу</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h2>Частина 3. Ключові технічні сценарії QA (Smoke & Core)</h2>

<div class="case-card">
  <div class="case-header">
    <div class="case-title">QA01. Перший візит і відмова від аналітики</div>
    <div class="case-badges">
      <span class="badge badge-p1">P1 Smoke</span>
      <span class="badge badge-mode">Режим A</span>
    </div>
  </div>
  <div class="field-label">Передумови:</div>
  <p>Відкрити https://uaroute.com у новому приватному вікні (Incognito).</p>
  <div class="field-label">Кроки:</div>
  <ol>
    <li>Оглянути банер згоди внизу екрана.</li>
    <li>Натиснути кнопку «Без аналітики».</li>
    <li>Перейти в розділ «Маршрути», повернутися на головну та оновити сторінку.</li>
  </ol>
  <div class="field-label">Очікуваний результат:</div>
  <p>Банер закривається. Після відмови пошук і всі сторінки повністю функціональні. При переході між сторінками банер не з'являється повторно.</p>
</div>

<div class="case-card">
  <div class="case-header">
    <div class="case-title">QA02. Пошук Львів → Ганновер (основний вибір)</div>
    <div class="case-badges">
      <span class="badge badge-p0">P0 Core</span>
      <span class="badge badge-mode">Режим A</span>
    </div>
  </div>
  <div class="field-label">Передумови:</div>
  <p>Головна сторінка https://uaroute.com.</p>
  <div class="field-label">Кроки:</div>
  <ol>
    <li>У полі «Звідки» вибрати «Львів».</li>
    <li>У полі «Куди» вибрати «Ганновер».</li>
    <li>Натиснути кнопку пошуку маршруту.</li>
  </ol>
  <div class="field-label">Очікуваний результат:</div>
  <p>Відбувається перехід на сторінку <span class="code">/routes/lviv-hannover/</span>. Відображається інформація про маршрут, форма уточнення поїздки та підказки для пасажирів.</p>
</div>

<div class="case-card">
  <div class="case-header">
    <div class="case-title">QA03. Вибір найближчого доступного міста з підказки</div>
    <div class="case-badges">
      <span class="badge badge-p1">P1</span>
      <span class="badge badge-mode">Режим A</span>
    </div>
  </div>
  <div class="field-label">Передумови:</div>
  <p>Сторінка хабу Львів <span class="code">/cities/lviv/</span>.</p>
  <div class="field-label">Кроки:</div>
  <ol>
    <li>Знайти блок «Поруч зі Львовом» або перелік містечок (Жовква, Яворів тощо).</li>
    <li>Перевірити наявність пояснення щодо посадки за адресою через перевізника.</li>
    <li>Обрати напрямок до Німеччини.</li>
  </ol>
  <div class="field-label">Очікуваний результат:</div>
  <p>Текст чітко пояснює, що назви містечок — це географічні орієнтири, а точну можливість посадки та заїзду узгоджує перевізник в індивідуальному запиті.</p>
</div>

<div class="case-card">
  <div class="case-header">
    <div class="case-title">QA04. Зміна напрямку поїздки (реверс пари)</div>
    <div class="case-badges">
      <span class="badge badge-p0">P0</span>
      <span class="badge badge-mode">Режим A</span>
    </div>
  </div>
  <div class="field-label">Передумови:</div>
  <p>Будь-яка сторінка з віджетом пошуку з заповненими містами.</p>
  <div class="field-label">Кроки:</div>
  <ol>
    <li>Натиснути кнопку зміни напрямку (стрілки реверсу ⇄).</li>
    <li>Перевірити заміну міст у полях «Звідки» і «Куди».</li>
  </ol>
  <div class="field-label">Очікуваний результат:</div>
  <p>Міста міняються місцями миттєво без збоїв інтерфейсу, зберігаючи логіку вибору.</p>
</div>

<div class="page-break"></div>

<div class="case-card">
  <div class="case-header">
    <div class="case-title">QA07. Заповнення форми звернення (валідація та контакт)</div>
    <div class="case-badges">
      <span class="badge badge-p0">P0</span>
      <span class="badge badge-mode">Режим B</span>
    </div>
  </div>
  <div class="field-label">Передумови:</div>
  <p>Сторінка маршруту <span class="code">/routes/lviv-hannover/</span>.</p>
  <div class="field-label">Кроки:</div>
  <ol>
    <li>Спробувати натиснути кнопку відправки форми з порожніми полями (перевірити появу червоних повідомлень про помилки).</li>
    <li>Вибрати дату (не дозволяти вибір минулої дати).</li>
    <li>Обрати кількість пасажирів (від 1 до 8).</li>
    <li>Ввести номер телефону з міжнародним кодом (наприклад, <span class="code">+380000000000</span> або <span class="code">+49...</span>).</li>
    <li>Натиснути кнопку підготовки WhatsApp.</li>
  </ol>
  <div class="field-label">Очікуваний результат:</div>
  <p>Відкривається WhatsApp із заздалегідь згенерованим текстом (маршрут, дата, пасажири). <strong>ЗУПИНИТИСЯ: не надсилати повідомлення.</strong></p>
</div>

<div class="case-card">
  <div class="case-header">
    <div class="case-title">QA11. Альтернативне посилання на сайт перевізника</div>
    <div class="case-badges">
      <span class="badge badge-p1">P1</span>
      <span class="badge badge-mode">Режим A</span>
    </div>
  </div>
  <div class="field-label">Передумови:</div>
  <p>Віджет запиту перевізнику на сторінці маршруту.</p>
  <div class="field-label">Кроки:</div>
  <ol>
    <li>Знайти посилання «Сайт перевізника ↗» поруч або під формою.</li>
    <li>Перевірити, чи веде воно на офіційний сайт партнера з відповідними реферальними параметрами.</li>
  </ol>
  <div class="field-label">Очікуваний результат:</div>
  <p>Посилання доступне, помітне, не вимагає заповнення полів форми й відкривається у новій вкладці.</p>
</div>

<div class="case-card">
  <div class="case-header">
    <div class="case-title">QA18. Поведінка на мобільному телефоні (375px)</div>
    <div class="case-badges">
      <span class="badge badge-p0">P0 Mobile</span>
      <span class="badge badge-mode">Режим A</span>
    </div>
  </div>
  <div class="field-label">Передумови:</div>
  <p>Реальний смартфон (iPhone Safari або Android Chrome) або режим емуляції 375×812.</p>
  <div class="field-label">Кроки:</div>
  <ol>
    <li>Прокрутити сторінку маршруту вниз.</li>
    <li>Звернути увагу на нижню закріплену плашку (Sticky Bar).</li>
    <li>Натиснути на кнопку плашки.</li>
  </ol>
  <div class="field-label">Очікуваний результат:</div>
  <p>Плашка плавно фокусує екран на формі запиту, не перекриває основний текст і не спричиняє горизонтального скролу сайту.</p>
</div>

<div class="case-card">
  <div class="case-header">
    <div class="case-title">QA31. Сторінка 404 (Не знайдено)</div>
    <div class="case-badges">
      <span class="badge badge-p1">P1</span>
      <span class="badge badge-mode">Режим A</span>
    </div>
  </div>
  <div class="field-label">Передумови:</div>
  <p>Відкрити адресу неіснуючого маршруту, наприклад https://uaroute.com/routes/unknown-route/.</p>
  <div class="field-label">Очікуваний результат:</div>
  <p>Сторінка чітко інформує про відсутність маршруту та містить активне посилання на каталог «Всі маршрути».</p>
</div>

<h2>Частина 4. Шаблон баг-репорту для QA</h2>
<div class="meta-box">
  <p><strong>Заголовок:</strong> [Короткий опис дефекту, сторінка]</p>
  <p><strong>Середовище:</strong> Пристрій (наприклад, iPhone 15), ОС (iOS 17.5), Браузер (Safari), Роздільна здатність.</p>
  <p><strong>Кроки для відтворення:</strong><br>
  1. Відкрити...<br>
  2. Натиснути...<br>
  3. Ввести...</p>
  <p><strong>Очікувана поведінка:</strong> Що мало статися за специфікацією.</p>
  <p><strong>Фактична поведінка:</strong> Що відбулося насправді (додати скриншот).</p>
  <p><strong>Рівень критичності:</strong> Blocker / Critical / Major / Minor / UX Observation.</p>
</div>

</body>
</html>
`;

const htmlPath = path.resolve('output/qa-2026-10-31/test-cases-package.html');
const pdfPath = path.resolve('output/qa-2026-10-31/UARoute-QA-Test-Cases-2026-10-31.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('HTML generated at:', htmlPath);

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const cmd = `"${chromePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer file://${htmlPath}`;

console.log('Running Chrome headless to generate PDF...');
execSync(cmd, { stdio: 'inherit' });

const stats = fs.statSync(pdfPath);
console.log(`PDF successfully created: ${pdfPath} (${stats.size} bytes)`);
