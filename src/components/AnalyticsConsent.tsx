"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

const consentKey = "uaroute:analytics-choice:v1";
import { applyAnalyticsConsent } from "@/lib/analytics-consent";
import { analyticsConfiguration } from "@/config/analytics";

const { enabled: configured } = analyticsConfiguration();
let sessionChoice: string | null = null;

function getChoice() {
  if (typeof window === "undefined") return null;
  if (sessionChoice) return sessionChoice;
  try {
    const stored = window.localStorage.getItem(consentKey);
    return stored === "accepted" || stored === "declined" ? stored : null;
  } catch {
    return null;
  }
}

function subscribe(callback: () => void) {
  const syncStorage = () => { sessionChoice = null; callback(); };
  window.addEventListener("storage", syncStorage);
  window.addEventListener("uaroute:privacy-choice", callback);
  return () => {
    window.removeEventListener("storage", syncStorage);
    window.removeEventListener("uaroute:privacy-choice", callback);
  };
}

export function AnalyticsConsent() {
  const choice = useSyncExternalStore(subscribe, getChoice, () => null);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    applyAnalyticsConsent(configured && choice === "accepted");
  }, [choice]);

  function choose(accepted: boolean) {
    const value = accepted ? "accepted" : "declined";
    sessionChoice = value;
    try {
      window.localStorage.setItem(consentKey, value);
    } catch {
      // The choice still applies for this page if the browser disallows storage.
    }
    applyAnalyticsConsent(configured && accepted);
    window.dispatchEvent(new Event("uaroute:privacy-choice"));
    setShowChoices(false);
  }

  return (
    <div className="container-page relative border-t border-border py-6">
      {configured && (showChoices || choice === null) ? (
        <section aria-labelledby="analytics-choice-title" className="max-w-3xl">
          <h2 id="analytics-choice-title" className="type-label">Аналітика відвідувань</h2>
          <p className="mt-3 type-body-small text-muted-foreground">
            За вашою згодою Google Analytics допоможе зрозуміти, які напрямки шукають відвідувачі.
            Ми не передаємо туди номер телефону, обрану дату чи текст повідомлення.
            Відмова не впливає на пошук і звернення до перевізника.{" "}
            <Link href="/privacy/" className="link-underline">Про приватність</Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => choose(false)} className="min-h-11 border border-border-strong px-4 type-button">
              Без аналітики
            </button>
            <button type="button" onClick={() => choose(true)} className="min-h-11 border border-border-strong px-4 type-button">
              Дозволити аналітику
            </button>
          </div>
        </section>
      ) : configured ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="type-caption" role="status">
            {choice === "accepted" ? "Аналітику відвідувань дозволено." : "Аналітику відвідувань вимкнено."}
          </p>
          <button type="button" onClick={() => setShowChoices(true)} className="min-h-11 type-caption link-underline">
            Налаштувати аналітику
          </button>
        </div>
      ) : (
        <p className="type-caption">Необов’язкова аналітика відвідувань вимкнена.</p>
      )}
    </div>
  );
}
