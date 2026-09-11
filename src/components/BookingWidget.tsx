"use client";

import { RouteCapsule } from "@/components/brand/RouteCapsule";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useInquiry } from "@/components/inquiry";
import { withUtm } from "@/config/site";
import { getCarrier } from "@/data/carriers";
import { track } from "@/lib/analytics";
import { resolveDesk } from "@/lib/whatsapp";

export function BookingWidget() {
  const {
    route,
    travelDate,
    phone,
    passengers,
    errors,
    setTravelDate,
    setPhone,
    setPassengers,
    submit,
  } = useInquiry();

  const desk = resolveDesk(route);
  const carrier = getCarrier(route.carrierIds[0] ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const fieldClass =
    "h-12 w-full border border-input bg-background px-3 text-base text-foreground focus:border-primary";

  return (
    <section className="border border-border-strong bg-card p-6">
      <p className="type-label text-muted-foreground">Запит перевізнику</p>
      <h2 className="mt-3 type-h2">Уточнити поїздку</h2>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-foreground">
          {route.origin.name} → {route.destination.name}
        </span>
        <RouteCapsule items={route.corridor} codes />
      </div>

      <p className="mt-4 type-body-small text-muted-foreground">
        Маршрут підставляється автоматично — заповніть дату, телефон і кількість пасажирів.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-date" className="type-label text-muted-foreground">
            Дата поїздки
          </label>
          <input
            id="inquiry-date"
            type="date"
            required
            min={today}
            value={travelDate}
            onChange={(event) => setTravelDate(event.target.value)}
            aria-invalid={Boolean(errors.travelDate)}
            aria-describedby={errors.travelDate ? "inquiry-date-error" : undefined}
            className={`mt-2 ${fieldClass}`}
          />
          {errors.travelDate ? (
            <p id="inquiry-date-error" className="mt-2 text-sm text-destructive">
              {errors.travelDate}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="inquiry-passengers" className="type-label text-muted-foreground">
            Пасажирів
          </label>
          <select
            id="inquiry-passengers"
            value={passengers}
            onChange={(event) => setPassengers(Number(event.target.value))}
            className={`mt-2 ${fieldClass}`}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="inquiry-phone" className="type-label text-muted-foreground">
            Телефон для зв&apos;язку
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="+38 0__ ___ __ __"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "inquiry-phone-error" : "inquiry-phone-hint"}
            className={`mt-2 ${fieldClass}`}
          />
          {errors.phone ? (
            <p id="inquiry-phone-error" className="mt-2 text-sm text-destructive">
              {errors.phone}
            </p>
          ) : (
            <p id="inquiry-phone-hint" className="mt-2 type-caption">
              Номер потрапляє лише у ваше повідомлення перевізнику. UARoute його не зберігає.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => submit("booking_widget")}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-primary px-5 type-button text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <WhatsAppIcon />
          {desk ? "Написати Koval у WhatsApp" : "Перейти на сайт Koval"}
        </button>

        {carrier ? (
          <a
            href={withUtm(carrier.website, `${route.slug}_booking_widget`)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() =>
              track("koval_site_click", {
                routeSlug: route.slug,
                ctaLocation: "booking_widget",
                conversionType: "koval_site",
              })
            }
            className="inline-flex h-12 items-center justify-center border border-border-strong px-5 type-button hover:bg-secondary"
          >
            Сайт Koval ↗
          </a>
        ) : null}
      </div>

      <p className="mt-4 type-caption leading-relaxed">
        Ви будете перенаправлені у WhatsApp до Koval для уточнення поїздки. Це заявка, а не
        підтверджене бронювання — місце, час і вартість підтверджує перевізник.
        {desk ? ` Напрямок обслуговує: ${desk.label}.` : ""}
      </p>
    </section>
  );
}
