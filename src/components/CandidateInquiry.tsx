"use client";

import { useId, useState } from "react";

import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { track, type CtaLocation } from "@/lib/analytics";
import type { City } from "@/data/types";
import { getCarrier } from "@/data/carriers";
import { KovalReferralLink } from "@/components/KovalReferralLink";
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
  const idPrefix = useId();
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
  const fieldClass = "h-12 w-full border border-input bg-background px-3 text-base text-foreground focus:border-primary";

  function submit() {
    const validation = validateInquiry({ travelDate, phone, passengers });
    if (!validation.ok) {
      setErrors(validation.errors);
      document.getElementById(validation.errors.travelDate ? dateId : phoneId)?.focus();
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

  return (
    <section className="border border-border-strong bg-card p-6" aria-labelledby={`${idPrefix}-candidate-inquiry-title`}>
      <p className="type-label text-muted-foreground">Запит перевізнику Коваль</p>
      <h2 id={`${idPrefix}-candidate-inquiry-title`} className="mt-3 type-h2">{origin.name} → {destination.name}</h2>
      <p className="mt-4 type-body-small text-muted-foreground">
        Додайте бажану дату, кількість пасажирів і телефон. У повідомленні перевізнику можна уточнити можливість поїздки, вартість, місце посадки й умови для багажу.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={dateId} className="type-label text-muted-foreground">Бажана дата поїздки</label>
          <input id={dateId} type="date" required min={today} value={travelDate}
            onChange={(event) => setTravelDate(event.target.value)} aria-invalid={Boolean(errors.travelDate)} aria-describedby={errors.travelDate ? dateErrorId : undefined}
            className={`mt-2 ${fieldClass}`} />
          {errors.travelDate ? <p id={dateErrorId} className="mt-2 text-sm text-destructive">{errors.travelDate}</p> : null}
        </div>
        <div>
          <label htmlFor={passengerId} className="type-label text-muted-foreground">Пасажирів</label>
          <select id={passengerId} value={passengers} onChange={(event) => setPassengers(Number(event.target.value))}
            className={`mt-2 ${fieldClass}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={phoneId} className="type-label text-muted-foreground">Телефон для зв’язку</label>
          <input id={phoneId} type="tel" required inputMode="tel" autoComplete="tel" placeholder="+38 0__ ___ __ __"
            value={phone} onChange={(event) => setPhone(event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? phoneErrorId : phoneHintId}
            className={`mt-2 ${fieldClass}`} />
          {errors.phone ? <p id={phoneErrorId} className="mt-2 text-sm text-destructive">{errors.phone}</p> :
            <p id={phoneHintId} className="mt-2 type-caption">Телефон і дата потрібні для повідомлення перевізнику. UARoute їх не зберігає.</p>}
        </div>
      </div>

      <button type="button" onClick={submit}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-5 type-button text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto">
        <WhatsAppIcon /> Уточнити поїздку в WhatsApp
      </button>
      {koval ? (
        <p className="mt-4 type-caption">
          Зручніше звернутися через сайт? <KovalReferralLink className="underline underline-offset-2" href={koval.website}
            content="candidate_inquiry" ctaLocation={ctaLocation}
            referralContext={{ originCityId: origin.id, destinationCityId: destination.id, sourcePath }}>
            Перейдіть на сайт Коваль
          </KovalReferralLink>.
        </p>
      ) : null}
      <p className="mt-4 type-caption leading-relaxed">У WhatsApp перевірте повідомлення, додайте запитання про зустріч або багаж і надішліть його. Коваль перевірить можливість поїздки на вашу дату. Запит не резервує місце.</p>
    </section>
  );
}
