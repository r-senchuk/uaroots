import type { NearbyPlaceContext } from "@/data/city-hubs";

type NearbyPlacesProps = {
  heading: string;
  intro: string;
  actionText: string;
  places: readonly NearbyPlaceContext[];
};

export function NearbyPlaces({ heading, intro, actionText, places }: NearbyPlacesProps) {
  return (
    <section className="border-y border-border-strong bg-secondary/40" aria-labelledby="nearby-places-heading">
      <div className="container-page py-10 sm:py-12">
        <h2 id="nearby-places-heading" className="type-h2">{heading}</h2>
        <p className="mt-3 max-w-3xl type-body-small text-muted-foreground">{intro}</p>
        {places.length > 0 ? (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {places.map((place) => (
              <li key={place.contentKey} className="border border-border-strong bg-background p-4">
                <h3 className="font-display text-lg">
                  {place.name}{place.localName ? <span className="type-body-small text-muted-foreground"> ({place.localName})</span> : null}
                </h3>
                <p className="mt-2 type-body-small text-muted-foreground">{place.guidance}</p>
                <p className="mt-3 type-caption text-muted-foreground">
                  Географічна довідка: <a className="inline-flex min-h-11 items-center link-underline" href={place.geographySource.url} target="_blank" rel="noreferrer" aria-label={`Географічне джерело: ${place.name}`}>джерело</a>, перевірено {place.geographySource.checkedAt}.
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        <a href="#search-heading" className="mt-5 inline-flex min-h-11 items-center link-underline">
          {actionText} ↑
        </a>
      </div>
    </section>
  );
}
