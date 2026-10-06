"use client";

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

  const desk = resolveDesk(route);
  const carrier = getCarrier(route.carrierIds[0] ?? "");
  const candidateInquiry =
    "serviceMode" in route && route.serviceMode === "candidate_inquiry";
  const today = localTodayISO();
  const fieldClass =
    "h-12 w-full border border-input bg-background px-3 text-base text-foreground focus:border-primary";

  return (
    <section className="border border-border-strong bg-card p-6">
      <p className="type-label text-muted-foreground">Запит перевізнику{carrier ? ` ${carrier.name}` : ""}</p>
      <h2 className="mt-3 type-h2">Уточнити поїздку</h2>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-foreground">
          {route.origin.name} → {route.destination.name}
        </span>
      </div>

      <p className="mt-4 type-body-small text-muted-foreground">
        Додайте бажану дату, кількість пасажирів і телефон. У повідомленні перевізнику можна уточнити можливість поїздки, вартість, місце посадки й умови для багажу.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-date" className="type-label text-muted-foreground">
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
            <p id="inquiry-phone-hint" className="mt-2 type-caption">
              Телефон і дата потрібні для повідомлення перевізнику. UARoute їх не зберігає.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => submit("booking_widget")}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-5 py-3 type-button leading-snug text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <WhatsAppIcon className="shrink-0" />
          <span className="min-w-0 text-center whitespace-normal">
            {candidateInquiry
              ? desk
                ? "Уточнити поїздку в WhatsApp"
                : "Уточнити поїздку на сайті перевізника"
              : desk
                ? "Уточнити поїздку в WhatsApp"
                : "Перейти на сайт перевізника"}
          </span>
        </button>

        {carrier ? (
          <KovalReferralLink
            href={carrier.website}
            content={`${route.slug}_booking_widget`}
            ctaLocation="booking_widget"
            routeId={route.id}
            routeSlug={route.slug}
            referralContext={{
              originCityId: route.origin.id,
              destinationCityId: route.destination.id,
              sourcePath: `/routes/${route.slug}/`,
            }}
            className="inline-flex min-h-12 w-full items-center justify-center border border-border-strong px-5 py-3 text-center leading-snug type-button hover:bg-secondary"
          >
            Сайт {carrier.name} ↗
          </KovalReferralLink>
        ) : null}
      </div>

      <p className="mt-4 type-caption leading-relaxed">
        У WhatsApp перевірте повідомлення, додайте запитання про зустріч або багаж і надішліть його. Можливість поїздки на вашу дату та умови погодьте з перевізником. Запит не резервує місце.
        {desk ? ` Контакт перевізника: ${desk.label}.` : ""}
      </p>
    </section>
  );
}
