import Link from "next/link";

export function PermanentRedirect({ href }: { href: string }) {
  return (
    <div className="container-page section-band">
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(href)});`,
        }}
      />
      <p className="type-label text-muted-foreground">Перенаправлення</p>
      <h1 className="mt-6 type-h1">Ця адреса змінилася</h1>
      <p className="mt-4 max-w-md type-body text-muted-foreground">
        Продовжіть на{" "}
        <Link href={href} className="text-primary link-underline">
          оновленій сторінці
        </Link>
        .
      </p>
    </div>
  );
}
