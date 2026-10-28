"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { RouteEmptyState } from "@/components/brand/states";
import { KovalReferralLink } from "@/components/KovalReferralLink";
import { getCarrier } from "@/data/carriers";

import { CandidateInquiry } from "@/components/CandidateInquiry";
import { priorityOriginCityIds } from "@/data/discovery";
import { getCity } from "@/data/cities";
import { findRouteByCities, isCandidateInquiryEligiblePair, listDiscoveryCities, searchCities } from "@/data/queries";
import type { City } from "@/data/types";
import { track, type CtaLocation } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ukrainianDiscoveryCities = listDiscoveryCities("UA");
const germanDiscoveryCities = listDiscoveryCities("DE");

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  city: City | null;
  country?: string;
  excludedCountry?: string;
  onChange: (value: string) => void;
  onSelect: (city: City) => void;
};

function CityField({ label, placeholder, value, city, country, excludedCountry, onChange, onSelect }: FieldProps) {
  const inputId = useId();
  const listId = `${inputId}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(
    () => (city && city.name === value ? [] : searchCities(value, country || excludedCountry ? Number.MAX_SAFE_INTEGER : 6).filter((item) => (!country || item.country === country) && item.country !== excludedCountry).slice(0, 6)),
    [value, city, country, excludedCountry],
  );
  const isOpen = open && suggestions.length > 0;

  function commit(next: City) {
    onSelect(next);
    setOpen(false);
    setActive(0);
  }

  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={inputId} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        className="field-rule search-field mt-2 border-foreground"
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(event) => {
          if (!isOpen) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % suggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index - 1 + suggestions.length) % suggestions.length);
          } else if (event.key === "Enter") {
            const picked = suggestions[active];
            if (picked) {
              event.preventDefault();
              commit(picked);
            }
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-30 w-full overflow-hidden border border-border-strong bg-popover shadow-[var(--shadow-lifted)]"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={cn(
                "cursor-pointer px-4 py-3",
                index === active ? "bg-secondary" : "bg-transparent",
              )}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                if (blurTimer.current) clearTimeout(blurTimer.current);
                commit(suggestion);
              }}
            >
              <span className="block min-w-0 font-display text-lg leading-tight text-foreground">
                {suggestion.name}
              </span>
              <span className="mt-1 block min-w-0 text-sm text-muted-foreground">{suggestion.country}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export type CityChoice = {
  city: City;
  departureHref?: string;
  returnHref?: string;
};

type RouteSearchProps = {
  sourcePath?: string;
  ctaLocation?: CtaLocation;
  initialOriginId?: string;
  initialDestinationId?: string;
  showPilotChoices?: boolean;
  overviewCity?: City;
  choiceDirections?: CityChoice[];
  choiceHeading?: string;
  children?: ReactNode;
};

export function RouteSearch({
  sourcePath = "/",
  ctaLocation = "hero",
  initialOriginId,
  initialDestinationId,
  showPilotChoices = false,
  overviewCity,
  choiceDirections,
  choiceHeading,
  children,
}: RouteSearchProps) {
  const router = useRouter();
  const initialOrigin = initialOriginId ? getCity(initialOriginId) ?? null : null;
  const initialDestination = initialDestinationId ? getCity(initialDestinationId) ?? null : null;
  const [originText, setOriginText] = useState(initialOrigin?.name ?? "");
  const [destinationText, setDestinationText] = useState(initialDestination?.name ?? "");
  const [origin, setOrigin] = useState<City | null>(initialOrigin);
  const [destination, setDestination] = useState<City | null>(initialDestination);
  const [direction, setDirection] = useState<"to-germany" | "to-ukraine">(initialOrigin?.country === "Німеччина" || initialDestination?.country === "Україна" ? "to-ukraine" : "to-germany");
  const [message, setMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [candidatePair, setCandidatePair] = useState<{ origin: City; destination: City } | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const selectedRoute = origin && destination ? findRouteByCities(origin.id, destination.id, { commercialOnly: true }) : undefined;

  useEffect(() => {
    if (!candidatePair && !notFound) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [candidatePair, notFound, searchAttempt]);

  function resetResult() {
    setMessage(null);
    setNotFound(false);
    setCandidatePair(null);
  }

  function chooseCity(side: "origin" | "destination", city: City | null) {
    resetResult();
    if (side === "origin") {
      setOrigin(city);
      setOriginText(city?.name ?? "");
    } else {
      setDestination(city);
      setDestinationText(city?.name ?? "");
    }
  }

  function chooseOverviewCity(city: City) {
    if (!overviewCity) return;
    resetResult();
    const ukrainianCity = city.countryCode === "UA" ? city : overviewCity.countryCode === "UA" ? overviewCity : null;
    const germanCity = city.countryCode === "DE" ? city : overviewCity.countryCode === "DE" ? overviewCity : null;
    const nextOrigin = direction === "to-germany" ? ukrainianCity : germanCity;
    const nextDestination = direction === "to-germany" ? germanCity : ukrainianCity;
    setOrigin(nextOrigin);
    setOriginText(nextOrigin?.name ?? "");
    setDestination(nextDestination);
    setDestinationText(nextDestination?.name ?? "");
    searchRef.current?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
    submitRef.current?.focus({ preventScroll: true });
  }

  const priorityCities = priorityOriginCityIds.map((id) => getCity(id)).filter((city): city is City => Boolean(city));
  const selectedUkrainian = (direction === "to-germany" ? origin : destination)?.country === "Україна"
    ? (direction === "to-germany" ? origin : destination) : null;
  const selectedGerman = (direction === "to-germany" ? destination : origin)?.country === "Німеччина"
    ? (direction === "to-germany" ? destination : origin) : null;

  function selectPilotCity(city: City) {
    const isGerman = city.country === "Німеччина";
    const isOrigin = direction === "to-germany" ? !isGerman : isGerman;
    chooseCity(isOrigin ? "origin" : "destination", city);
  }

  function changeDirection(next: "to-germany" | "to-ukraine") {
    if (next === direction) return;
    resetResult();
    setDirection(next);
    const currentCities = [origin, destination].filter((city): city is City => Boolean(city));
    const ukrainianCity = currentCities.find((city) => city.country === "Україна") ?? null;
    const germanCity = currentCities.find((city) => city.country === "Німеччина") ?? null;
    const nextOrigin = next === "to-germany" ? ukrainianCity : germanCity;
    const nextDestination = next === "to-germany" ? germanCity : ukrainianCity;
    setOrigin(nextOrigin);
    setOriginText(nextOrigin?.name ?? "");
    setDestination(nextDestination);
    setDestinationText(nextDestination?.name ?? "");
  }

  function submit() {
    if (!origin || !destination) {
      setNotFound(false);
      setCandidatePair(null);
      setMessage("Оберіть місто відправлення та місто призначення.");
      return;
    }

    if (origin.country === destination.country) {
      resetResult();
      setMessage("Оберіть міста в різних країнах: одне в Україні, інше — у Німеччині.");
      return;
    }

    const route = findRouteByCities(origin.id, destination.id, { commercialOnly: true });
    track("route_search_completed", {
      origin: origin.slug,
      destination: destination.slug,
      destinationCountry: destination.country,
      resultCount: route ? 1 : 0,
      matchedRouteId: route?.id,
      ...(route ? { routeSlug: route.slug } : {}),
      targetPath: sourcePath,
      ctaLocation,
    });

    if (!route) {
      setSearchAttempt((attempt) => attempt + 1);
      setMessage(null);
      const eligible = isCandidateInquiryEligiblePair(origin, destination);
      setCandidatePair(eligible ? { origin, destination } : null);
      setNotFound(!eligible);
      return;
    }

    setMessage(null);
    setNotFound(false);
    setCandidatePair(null);
    router.push(`/routes/${route.slug}/`);
  }

  return (
    <div ref={searchRef} className="scroll-mt-[calc(var(--header-height,4.5rem)+1rem)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className={showPilotChoices ? "flex flex-col gap-3" : "flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8"}>
          {showPilotChoices ? (
            <div className="sm:col-span-2">
              <fieldset>
                <legend className="text-sm font-medium text-muted-foreground">Напрямок: {direction === "to-germany" ? "Україна → Німеччина" : "Німеччина → Україна"}</legend>
                <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Напрямок поїздки">
                  <button type="button" aria-pressed={direction === "to-germany"}
                    onClick={() => changeDirection("to-germany")}
                    className="min-h-11 border border-foreground px-3 type-button text-base transition-colors hover:bg-secondary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">
                    До Німеччини
                  </button>
                  <button type="button" aria-pressed={direction === "to-ukraine"}
                    onClick={() => changeDirection("to-ukraine")}
                    className="min-h-11 border border-foreground px-3 type-button text-base transition-colors hover:bg-secondary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">
                    До України
                  </button>
                </div>
              </fieldset>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {(direction === "to-germany" ? ["ukraine", "germany"] : ["germany", "ukraine"]).map((country, index) => {
                  const isUkrainian = country === "ukraine";
                  const selected = isUkrainian ? selectedUkrainian : selectedGerman;
                  const cities = isUkrainian ? ukrainianDiscoveryCities : germanDiscoveryCities;
                  const countryLabel = isUkrainian ? "Українське місто" : "Місто в Німеччині";
                  return (
                    <label key={country} className="text-sm font-medium text-muted-foreground">
                      {index === 0 ? "Звідки" : "Куди"} · {isUkrainian ? "Україна" : "Німеччина"}
                      <select
                        value={selected?.id ?? ""}
                        onChange={(event) => chooseCity(index === 0 ? "origin" : "destination", event.target.value ? getCity(event.target.value) ?? null : null)}
                        className="field-rule search-field mt-2 border-foreground"
                        aria-label={countryLabel}
                      >
                        <option value="">Оберіть місто</option>
                        {selected && !cities.some((city) => city.id === selected.id) ? <option value={selected.id}>{selected.name} · вибрано через пошук</option> : null}
                        {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                      </select>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
          {showPilotChoices ? null : (
            <>
              <CityField
                label="Звідки"
                placeholder="Львів"
                excludedCountry={destination?.country}
                value={originText}
                city={origin}
                onChange={(value) => {
                  resetResult();
                  setOriginText(value);
                  setOrigin(null);
                }}
                onSelect={(city) => {
                  chooseCity("origin", city);
                }}
              />
              <span aria-hidden className="hidden pb-4 font-mono text-sm text-muted-foreground sm:block">
                →
              </span>
              <CityField
                label="Куди"
                placeholder="Ганновер"
                excludedCountry={origin?.country}
                value={destinationText}
                city={destination}
                onChange={(value) => {
                  resetResult();
                  setDestinationText(value);
                  setDestination(null);
                }}
                onSelect={(city) => {
                  chooseCity("destination", city);
                }}
              />
            </>
          )}
          {showPilotChoices && origin && destination && (selectedRoute || isCandidateInquiryEligiblePair(origin, destination)) ? (
            <p className="text-sm text-muted-foreground">
              {selectedRoute
                ? "Далі — інформація про напрямок і запит перевізнику."
                : "Для цього напрямку можна одразу підготувати запит перевізнику нижче."}
            </p>
          ) : null}
          <button
            ref={submitRef}
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center bg-primary px-7 type-button text-base text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Знайти маршрут
          </button>
          {showPilotChoices ? (
            <div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">Швидкий вибір міста {direction === "to-germany" ? "відправлення" : "прибуття"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {priorityCities.map((city) => (
                  <button key={city.id} type="button" onClick={() => selectPilotCity(city)}
                    className="min-h-11 border border-foreground px-3 type-button text-base hover:bg-secondary">
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {showPilotChoices ? (
            <details>
              <summary className="min-h-11 cursor-pointer py-3 type-button text-base">Пошук за назвою або латинкою</summary>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <CityField
                  label="Звідки"
                  placeholder={direction === "to-germany" ? "Львів або Lviv" : "Целле або Celle"}
                  country={direction === "to-germany" ? "Україна" : "Німеччина"}
                  value={originText}
                  city={origin}
                  onChange={(value) => {
                    resetResult();
                    setOriginText(value);
                    setOrigin(null);
                  }}
                  onSelect={(city) => chooseCity("origin", city)}
                />
                <CityField
                  label="Куди"
                  placeholder={direction === "to-germany" ? "Целле або Celle" : "Львів або Lviv"}
                  country={direction === "to-germany" ? "Німеччина" : "Україна"}
                  value={destinationText}
                  city={destination}
                  onChange={(value) => {
                    resetResult();
                    setDestinationText(value);
                    setDestination(null);
                  }}
                  onSelect={(city) => chooseCity("destination", city)}
                />
              </div>
            </details>
          ) : null}
        </div>

        <p aria-live="polite" className="mt-4 min-h-5 text-sm text-muted-foreground">
          {message}
        </p>
      </form>

      {children}

      {candidatePair ? (
        <div ref={resultRef} tabIndex={-1} className="mt-6 scroll-mt-[calc(var(--header-height,4.5rem)+1rem)]" key={`${candidatePair.origin.id}-${candidatePair.destination.id}`}>
          <CandidateInquiry origin={candidatePair.origin} destination={candidatePair.destination} sourcePath={sourcePath} ctaLocation={ctaLocation} />
        </div>
      ) : null}

      {overviewCity && !candidatePair && !notFound && getCarrier("koval") ? (
        <div className="mt-4">
          <KovalReferralLink href={getCarrier("koval")!.website} content={`site_${ctaLocation}`} ctaLocation={ctaLocation} className="inline-flex min-h-11 items-center border border-border-strong px-4 text-sm hover:bg-secondary">Сайт перевізника ↗</KovalReferralLink>
          <p className="mt-2 text-sm text-muted-foreground">Загальний перехід на зовнішній сайт без вибраного маршруту. Дата й телефон не потрібні.</p>
        </div>
      ) : null}

      {notFound ? (
        <div ref={resultRef} tabIndex={-1} aria-live="polite" className="mt-6 scroll-mt-[calc(var(--header-height,4.5rem)+1rem)]">
          <p className="mb-3 type-label">{origin?.name} → {destination?.name}</p>
          <RouteEmptyState
            title="Ми поки не маємо інформації про цей маршрут."
            description="Спробуйте іншу пару міст або запитайте перевізника через його сайт про можливість поїздки на вашу дату."
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  resetResult();
                  searchRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
                  searchRef.current?.querySelector<HTMLElement>("select, input")?.focus({ preventScroll: true });
                }}
                className="inline-flex min-h-11 items-center justify-center bg-primary px-5 type-button text-base text-primary-foreground hover:bg-primary-hover"
              >
                Змінити міста
              </button>
              {getCarrier("koval") ? (
                <KovalReferralLink href={getCarrier("koval")!.website} content={`site_${ctaLocation}`} ctaLocation={ctaLocation} className="inline-flex min-h-11 items-center justify-center border border-border-strong px-5 type-button text-base hover:bg-secondary">
                  Сайт перевізника ↗
                </KovalReferralLink>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Перехід на сайт перевізника без вибраного маршруту. Дата й телефон не потрібні.</p>
          </RouteEmptyState>
        </div>
      ) : null}

      {overviewCity && choiceDirections && choiceHeading ? (
        <section className="mt-10" aria-labelledby="discovery-city-choices-heading">
          <h2 id="discovery-city-choices-heading" className="type-h2">{choiceHeading}</h2>
          <p className="mt-3 max-w-2xl type-body text-muted-foreground">
            Оберіть місто, щоб додати його до пошуку. Перевізник підтвердить можливість поїздки.
          </p>
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {choiceDirections.map(({ city, departureHref, returnHref }) => (
              <li key={city.id} className="border-t border-border-strong py-4">
                <h3 className="font-display text-xl">
                  {city.name}{city.countryCode === "DE" && city.aliases[0] ? <span className="type-body text-muted-foreground"> ({city.aliases[0]})</span> : null}
                </h3>
                <button
                  type="button"
                  aria-label={`Обрати місто ${city.name}`}
                  onClick={() => chooseOverviewCity(city)}
                  className="mt-1 inline-flex min-h-11 items-center type-body link-underline"
                >
                  Обрати місто в пошуку ↑
                </button>
                {departureHref || returnHref ? (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {departureHref ? <Link className="inline-flex min-h-11 items-center link-underline" href={departureHref}>{overviewCity.name} → {city.name}</Link> : null}
                    {returnHref ? <Link className="inline-flex min-h-11 items-center link-underline" href={returnHref}>{city.name} → {overviewCity.name}</Link> : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
