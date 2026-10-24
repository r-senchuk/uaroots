"use client";

import { useHydrated } from "@/lib/use-hydrated";
import { KovalReferralLink } from "@/components/KovalReferralLink";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useInquiry } from "@/components/inquiry";
import { getCarrier } from "@/data/carriers";
import { localTodayISO, resolveDesk } from "@/lib/whatsapp";

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

  const hydrated = useHydrated();
  const desk = resolveDesk(route);
  const carrier = getCarrier(route.carrierIds[0] ?? "");
  const today = localTodayISO();
  const fieldClass =
    "h-12 min-w-0 w-full border border-input bg-background px-3 text-base text-foreground focus:border-primary";

  return (
    <section className="border border-border-strong bg-card p-3 sm:p-6">
      <p className="type-label text-muted-foreground">Запит перевізнику</p>
      <h2 className="mt-3 type-h2">Уточнити поїздку</h2>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-foreground">
          {route.origin.name} → {route.destination.name}
        </span>
      </div>

      {desk ? (
        <p className="mt-4 type-body-small text-muted-foreground">
          Додайте бажану дату, кількість пасажирів і телефон. Відкриється WhatsApp із готовим текстом: перевірте його й надішліть самостійно.
        </p>
      ) : null}

      {carrier ? (
        <KovalReferralLink
          href={carrier.website}
          content={`${route.slug}_booking_widget`}
          ctaLocation="booking_widget"
          routeId={route.id}
          routeSlug={route.slug}
          referralContext={{ originCityId: route.origin.id, destinationCityId: route.destination.id, sourcePath: `/routes/${route.slug}/` }}
          className={desk
            ? "mt-5 inline-flex min-h-11 items-center justify-center border border-border-strong px-4 text-center text-sm font-medium hover:bg-secondary"
            : "mt-5 inline-flex min-h-12 w-full items-center justify-center bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary-hover"}
        >
          {desk ? "Сайт перевізника ↗" : "Перейти на сайт перевізника ↗"}
        </KovalReferralLink>
      ) : null}

      {desk ? <form noValidate onSubmit={(event) => { event.preventDefault(); submit("booking_widget"); }}>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-date" className="text-sm font-medium text-muted-foreground">
            Бажана дата поїздки
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
          <label htmlFor="inquiry-passengers" className="text-sm font-medium text-muted-foreground">
            Пасажирів
          </label>
          <select
            id="inquiry-passengers"
            aria-invalid={Boolean(errors.passengers)} aria-describedby={errors.passengers ? "inquiry-passengers-error" : undefined}
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
          {errors.passengers ? <p id={"inquiry-passengers-error"} role="alert" className="mt-2 text-sm text-destructive">{errors.passengers}</p> : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="inquiry-phone" className="text-sm font-medium text-muted-foreground">
            Телефон для зв’язку
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
            <p id="inquiry-phone-hint" className="mt-2 text-sm text-muted-foreground">
              Телефон і дата потрібні для повідомлення перевізнику. UARoute їх не зберігає.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="submit"
          disabled={!hydrated}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-5 py-3 type-button leading-snug text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {desk ? <WhatsAppIcon className="shrink-0" /> : null}
          <span className="min-w-0 text-center whitespace-normal [overflow-wrap:anywhere]">
            Уточнити поїздку в WhatsApp
          </span>
        </button>

      </div>
      </form> : null}

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {desk
          ? "Перевізник підтвердить можливість поїздки на бажану дату та її умови. Запит не резервує місце."
          : "Перевізник підтвердить можливість поїздки та умови. Перехід на його сайт не резервує місце."}
        {desk ? ` Контакт перевізника: ${desk.label}.` : ""}
      </p>
    </section>
  );
}
