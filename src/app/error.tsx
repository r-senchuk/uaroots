"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="container-page section-band">
      <p className="type-label text-muted-foreground">Помилка</p>
      <h1 className="mt-6 type-h1">Сторінка не завантажилася</h1>
      <p className="mt-4 max-w-md type-body text-muted-foreground">
        Спробуйте оновити сторінку або поверніться на головну.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center bg-primary px-6 type-button text-primary-foreground"
        >
          Спробувати ще раз
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center border border-border-strong px-6 type-button"
        >
          На головну
        </Link>
      </div>
    </div>
  );
}
