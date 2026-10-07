"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { applyAnalyticsConsent } from "@/lib/analytics-consent";
import { analyticsConfiguration } from "@/config/analytics";
import { createPrivacyChoice, legacyPrivacyChoiceKey, parsePrivacyChoice, privacyChoiceKey } from "@/lib/privacy-choice";

const { enabled: configured } = analyticsConfiguration();
let sessionChoice: string | null = null;
function getSnapshot() {
  if (typeof window === "undefined") return null;
  let stored = sessionChoice;
  if (!stored) {
    try { stored = window.localStorage.getItem(privacyChoiceKey); } catch { /* Session fallback. */ }
  }
  return parsePrivacyChoice(stored) ? stored : null;
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
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const choice = parsePrivacyChoice(snapshot);
  const [showChoices, setShowChoices] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const current = parsePrivacyChoice(snapshot);
    applyAnalyticsConsent(configured && current?.analytics === true);
    try { window.localStorage.removeItem(legacyPrivacyChoiceKey); } catch { /* Storage may be unavailable. */ }
    if (!current) return;
    let timer: number;
    const expire = () => {
      sessionChoice = null;
      try { window.localStorage.removeItem(privacyChoiceKey); } catch { /* Session choice expires too. */ }
      window.dispatchEvent(new Event("uaroute:privacy-choice"));
      applyAnalyticsConsent(false);
    };
    const checkExpiry = () => {
      if (current.expiresAt <= Date.now()) expire();
      else timer = window.setTimeout(checkExpiry, Math.min(current.expiresAt - Date.now(), 2_000_000_000));
    };
    checkExpiry();
    const onFocus = () => { if (current.expiresAt <= Date.now()) expire(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [snapshot]);
  useEffect(() => { if (showChoices) heading.current?.focus(); }, [showChoices]);
  useEffect(() => {
    const open = () => { setShowChoices(true); heading.current?.focus(); };
    window.addEventListener("uaroute:open-privacy", open);
    return () => window.removeEventListener("uaroute:open-privacy", open);
  }, []);

  function choose(accepted: boolean) {
    const value = JSON.stringify(createPrivacyChoice(configured && accepted));
    sessionChoice = value;
    try { window.localStorage.setItem(privacyChoiceKey, value); } catch { /* Apply without persistence. */ }
    window.dispatchEvent(new Event("uaroute:privacy-choice"));
    applyAnalyticsConsent(configured && accepted);
    setShowChoices(false);
    button.current?.focus();
  }

  const isOpen = showChoices || (configured && !choice);
  return (
    <div id="privacy-settings" className="container-page relative border-t border-border py-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="type-caption" role="status">
          {!configured ? "Необов’язкова аналітика відвідувань вимкнена." : choice?.analytics ? "Аналітику відвідувань дозволено." : "Аналітику відвідувань вимкнено."}
        </p>
        <button ref={button} type="button" onClick={() => setShowChoices(!showChoices)} aria-expanded={isOpen} aria-controls={isOpen ? "analytics-choices" : undefined} className="min-h-11 type-caption link-underline">Налаштування приватності</button>
        {choice?.analytics && <button type="button" onClick={() => choose(false)} className="min-h-11 type-caption link-underline">Вимкнути аналітику</button>}
      </div>
      {isOpen && (
        <section id="analytics-choices" aria-labelledby="analytics-choice-title"
          className={configured && !choice ? "fixed inset-x-0 bottom-0 z-50 max-h-[75dvh] overflow-y-auto border-t border-border-strong bg-background p-5 shadow-lg sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-xl sm:border sm:p-6" : "mt-4 max-w-3xl border border-border p-5"}>
          <h2 ref={heading} tabIndex={-1} id="analytics-choice-title" className="type-h2">Налаштування приватності</h2>
          <p className="mt-3 type-body-small">Ваш вибір зберігається на 180 днів. Рекламні інструменти та рекламні розсилки не ввімкнені.</p>
          {configured ? <>
            <p className="mt-3 type-body-small">За вашим дозволом Google Analytics отримуватиме відомості про користування сайтом і технічні дані, щоб ми могли покращувати пошук напрямків. Телефон, дату поїздки, текст повідомлення й код звернення не передаємо. Відмова не впливає на пошук і звернення.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => choose(false)} className="min-h-11 border border-border-strong px-4 type-button">Без аналітики</button>
              <button type="button" onClick={() => choose(true)} className="min-h-11 border border-border-strong px-4 type-button">Дозволити аналітику</button>
            </div>
          </> : <>
            <p className="mt-3 type-body-small">Google Analytics і Google Tag Manager зараз не завантажуються для аналітики. Дозволити її в цій версії сайту неможливо.</p>
            <button type="button" onClick={() => choose(false)} className="mt-4 min-h-11 border border-border-strong px-4 type-button">Зберегти без аналітики</button>
          </>}
          <Link href="/privacy/" className="mt-4 inline-block py-2 type-body-small link-underline">Приватність і файли cookie</Link>
          {showChoices && (choice || !configured) && <button type="button" onClick={() => { setShowChoices(false); button.current?.focus(); }} className="ml-4 min-h-11 type-caption link-underline">Закрити налаштування</button>}
        </section>
      )}
    </div>
  );
}

export function PrivacySettingsButton() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event("uaroute:open-privacy"))} className="min-h-11 border border-border-strong px-4 type-button">Налаштування приватності</button>;
}
