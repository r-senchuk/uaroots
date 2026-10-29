"use client";

import { useId, useState } from "react";

import { InquiryDate, PassengerCount } from "@/components/InquiryFields";
import { useHydrated } from "@/lib/use-hydrated";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { JourneyActions } from "@/components/JourneyActions";
import { track, type CtaLocation } from "@/lib/analytics";
import type { City } from "@/data/types";
import { getCarrier, getDesk } from "@/data/carriers";
import { buildCandidateInquiryTarget, createLeadId, localTodayISO, validateInquiry } from "@/lib/whatsapp";

export function CandidateInquiry({
  origin,
  destination,
  sourcePath,
  ctaLocation,
}: {
  origin: City;
  destination: City;
  sourcePath: string;
  ctaLocation: CtaLocation;
}) {
  const hydrated = useHydrated();
  const idPrefix = useId();
  const anchorId = `${idPrefix}-candidate-anchor`;
  const dateId = `${idPrefix}-candidate-date`;
  const dateErrorId = `${dateId}-error`;
  const passengerId = `${idPrefix}-candidate-passengers`;
  const phoneId = `${idPrefix}-candidate-phone`;
  const phoneErrorId = `${phoneId}-error`;
  const phoneHintId = `${phoneId}-hint`;
  const [travelDate, setTravelDate] = useState("");
  const [phone, setPhone] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [errors, setErrors] = useState<{ travelDate?: string; phone?: string; passengers?: string }>({});
  const today = localTodayISO();
  const fieldClass = "h-12 min-w-0 w-full border border-foreground bg-background px-3 text-base text-foreground focus:border-primary";

  function submit() {
    const validation = validateInquiry({ travelDate, phone, passengers });
    if (!validation.ok) {
      setErrors(validation.errors);
      document.getElementById(validation.errors.travelDate ? `${idPrefix}-candidate-inquiry-title` : validation.errors.passengers ? passengerId : phoneId)?.focus();
      return;
    }
    setErrors({});
    const leadId = createLeadId();
    const target = buildCandidateInquiryTarget(
      { origin, destination, deskId: "koval-de", sourcePath, travelDate, phone, passengers },
      leadId,
    );
    const context = {
      origin: origin.id, destination: destination.id,
      destinationCountry: destination.country, passengerCount: passengers,
      leadId, deskId: "koval-de", ctaLocation, targetPath: sourcePath,
      conversionType: target.kind === "whatsapp" ? "whatsapp_inquiry" : "koval_site",
    } as const;
    track("booking_intent", context);
    track(target.kind === "whatsapp" ? "whatsapp_click" : "koval_site_click", context);
    window.open(target.url, "_blank", "noopener,noreferrer");
  }

  const koval = getCarrier("koval");
  const hasDesk = Boolean(getDesk("koval", "koval-de"));

  return (
    <section id={anchorId} className="border border-border-strong bg-card p-3 sm:p-6" aria-labelledby={`${idPrefix}-candidate-inquiry-title`}>
      <p className="type-label text-muted-foreground">Запит перевізнику</p>
      <h2 id={`${idPrefix}-candidate-inquiry-title`} tabIndex={-1} className="mt-3 scroll-mt-[calc(var(--header-height,4.5rem)+1rem)] type-h2">{origin.name} → {destination.name}</h2>
      {koval ? (
        <JourneyActions
          website={koval.website}
          hasDesk={hasDesk}
          anchorId={anchorId}
          originCityId={origin.id}
          destinationCityId={destination.id}
          sourcePath={sourcePath}
          ctaLocation={ctaLocation}
          content="candidate_inquiry"
        />
      ) : null}
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {hasDesk
          ? "Перевізник підтвердить можливість поїздки на бажану дату та її умови. Запит не резервує місце."
          : "Перевізник підтвердить можливість поїздки. Перехід на його сайт не резервує місце."}
      </p>

      {hasDesk ? <form noValidate onSubmit={(event) => { event.preventDefault(); submit(); }}>
      <p className="mt-4 type-body text-muted-foreground">
        Додайте бажану дату, кількість пасажирів і телефон. Відкриється WhatsApp із готовим текстом: перевірте його й надішліть самостійно.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={dateId} className="text-sm font-medium text-muted-foreground">Бажана дата поїздки</label>
          <InquiryDate id={dateId} type="date" required min={today} value={travelDate}
            onChange={(event) => setTravelDate(event.target.value)} aria-invalid={Boolean(errors.travelDate)} aria-describedby={errors.travelDate ? dateErrorId : undefined}
            className={`mt-2 ${fieldClass}`} />
          {errors.travelDate ? <p id={dateErrorId} role="alert" className="mt-2 text-sm text-destructive">{errors.travelDate}</p> : null}
        </div>
        <div>
          <label htmlFor={passengerId} className="text-sm font-medium text-muted-foreground">Пасажирів</label>
          <PassengerCount id={passengerId} value={passengers} onChange={setPassengers} invalid={Boolean(errors.passengers)} describedBy={errors.passengers ? `${passengerId}-error` : undefined} />
          {errors.passengers ? <p id={`${passengerId}-error`} role="alert" className="mt-2 text-sm text-destructive">{errors.passengers}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={phoneId} className="text-sm font-medium text-muted-foreground">Телефон для зв’язку</label>
          <input id={phoneId} type="tel" required inputMode="tel" autoComplete="tel" placeholder="+…"
            value={phone} onChange={(event) => setPhone(event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? phoneErrorId : phoneHintId}
            className={`mt-2 ${fieldClass}`} />
          {errors.phone ? <p id={phoneErrorId} className="mt-2 text-sm text-destructive">{errors.phone}</p> :
            <p id={phoneHintId} className="mt-2 text-sm text-muted-foreground">Номер будь-якої країни з кодом, наприклад +49, +48 або +380. Телефон і дата лише для повідомлення перевізнику; UARoute їх не зберігає.</p>}
        </div>
      </div>

      <button type="submit" disabled={!hydrated}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-5 py-3 type-button text-base text-center whitespace-normal [overflow-wrap:anywhere] text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto">
        <WhatsAppIcon /> Уточнити поїздку в WhatsApp
      </button>
      </form> : null}
    </section>
  );
}
