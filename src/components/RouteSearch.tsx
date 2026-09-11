"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";

import { RouteEmptyState } from "@/components/brand/states";
import { findRouteByCities, searchCities } from "@/data/queries";
import type { City } from "@/data/types";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  city: City | null;
  onChange: (value: string) => void;
  onSelect: (city: City) => void;
};

function CityField({ label, placeholder, value, city, onChange, onSelect }: FieldProps) {
  const inputId = useId();
  const listId = `${inputId}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(
    () => (city && city.name === value ? [] : searchCities(value)),
    [value, city],
  );
  const isOpen = open && suggestions.length > 0;

  function commit(next: City) {
    onSelect(next);
    setOpen(false);
    setActive(0);
  }

  return (
    <div className="relative flex-1">
      <label htmlFor={inputId} className="type-label text-muted-foreground">
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
        className="field-rule mt-2"
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
              <span className="mt-1 block min-w-0 type-meta">{suggestion.country}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function RouteSearch() {
  const router = useRouter();
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [origin, setOrigin] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  function submit() {
    if (!origin || !destination) {
      setNotFound(false);
      setMessage("Оберіть місто відправлення та місто призначення.");
      return;
    }

    const route = findRouteByCities(origin.id, destination.id);
    track("route_search_completed", {
      origin: origin.slug,
      destination: destination.slug,
      destinationCountry: destination.country,
      ...(route ? { routeSlug: route.slug } : {}),
      ctaLocation: "hero",
    });

    if (!route) {
      setMessage(null);
      setNotFound(true);
      return;
    }

    setMessage(null);
    setNotFound(false);
    router.push(`/routes/${route.slug}/`);
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
          <CityField
            label="Звідки"
            placeholder="Львів"
            value={originText}
            city={origin}
            onChange={(value) => {
              setOriginText(value);
              setOrigin(null);
            }}
            onSelect={(city) => {
              setOrigin(city);
              setOriginText(city.name);
            }}
          />
          <span aria-hidden className="hidden pb-4 font-mono text-sm text-muted-foreground sm:block">
            →
          </span>
          <CityField
            label="Куди"
            placeholder="Ганновер"
            value={destinationText}
            city={destination}
            onChange={(value) => {
              setDestinationText(value);
              setDestination(null);
            }}
            onSelect={(city) => {
              setDestination(city);
              setDestinationText(city.name);
            }}
          />
          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center bg-primary px-7 type-button text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Знайти маршрут
          </button>
        </div>

        <p aria-live="polite" className="mt-4 min-h-5 type-meta">
          {message}
        </p>
      </form>

      {notFound ? (
        <div aria-live="polite" className="mt-6">
          <RouteEmptyState
            title="Маршрут поки не знайдено"
            description="Перевірте назву міста або оберіть напрямок з атласу."
          >
            <Link
              href="/routes/"
              className="inline-flex h-11 items-center justify-center border border-border-strong px-5 type-button hover:bg-secondary"
            >
              Усі маршрути
            </Link>
          </RouteEmptyState>
        </div>
      ) : null}
    </div>
  );
}
