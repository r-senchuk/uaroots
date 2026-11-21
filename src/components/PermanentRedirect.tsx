import Link from "next/link";
import { serializeJsonLd } from "@/lib/json-ld";

export function assertSafeInternalHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//") || /[\r\n]/.test(href)) {
    throw new TypeError("PermanentRedirect requires a relative internal path");
  }
  return href;
}

export function PermanentRedirect({ href }: { href: string }) {
  const safeHref = assertSafeInternalHref(href);
  return (
    <div className="container-page section-band">
      <meta httpEquiv="refresh" content={`0;url=${safeHref}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${serializeJsonLd(safeHref)});`,
        }}
      />
      <p className="type-label text-muted-foreground">Перенаправлення</p>
      <h1 className="mt-6 type-h1">Ця адреса змінилася</h1>
      <p className="mt-4 max-w-md type-body text-muted-foreground">
        Продовжіть на{" "}
        <Link href={safeHref} className="text-primary link-underline">
          оновленій сторінці
        </Link>
        .
      </p>
    </div>
  );
}
