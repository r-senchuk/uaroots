"use client";

import { useState } from "react";

export function ShareRoute({ title, url }: { title: string; url: string }) {
  const [feedback, setFeedback] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [pending, setPending] = useState(false);

  async function copyLink() {
    setFeedback("");
    setShowLink(false);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setFeedback("Посилання на маршрут скопійовано.");
        return;
      } catch {
        // Clipboard access can be unavailable or denied. Offer manual copying.
      }
    }

    setShowLink(true);
    setFeedback("Скопіюйте посилання на маршрут і надішліть його тим, хто планує поїздку.");
  }

  async function share() {
    setPending(true);
    setFeedback("");
    setShowLink(false);

    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title, url });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }

      await copyLink();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-6 max-w-xl">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={share}
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center border border-border-strong px-5 type-button hover:bg-secondary disabled:opacity-60"
        >
          Поділитися маршрутом
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-11 items-center justify-center px-3 type-button text-primary link-underline"
        >
          Скопіювати посилання
        </button>
      </div>
      <p className="mt-3 type-caption">
        Збережіть посилання для наступної поїздки або надішліть тим, з ким їдете. Нову дату й умови щоразу погоджуйте з перевізником.
      </p>
      <p role="status" className={feedback ? "mt-3 type-caption" : "sr-only"}>
        {feedback}
      </p>
      {showLink ? (
        <label className="mt-3 block type-caption">
          Посилання на маршрут
          <input
            type="url"
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 min-h-11 w-full border border-input bg-background px-3 text-base text-foreground focus:border-primary"
          />
        </label>
      ) : null}
    </div>
  );
}
