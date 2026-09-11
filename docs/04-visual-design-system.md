# UARoute — Visual Design System

**Document status:** Living visual design specification  
**Product:** UARoute  
**Domain:** https://uaroute.com/  
**Language:** Ukrainian  
**Current milestone:** Milestone 1  
**Implementation snapshot (2026-09-11):** Shipped UI fonts are Playfair Display + IBM Plex Sans/Mono via `next/font` in `src/app/layout.tsx`. Constitution still names Instrument Serif / Work Sans as the preferred direction; changing tokens is a visual decision, not a stack ADR. `new_design/` is a gitignored Lovable spec — do not deploy it.

---

## 1. Purpose

This document records the visual direction that has been agreed for UARoute.

It defines only the visual principles and decisions that have already been established.

It does **not** invent additional brand rules, final token values, detailed component dimensions, or illustration specifications that have not yet been approved.

The purpose is to provide a stable visual reference for:

- coding agents,
- future UI work,
- future graphic work,
- future content templates.

`new_design/` (Lovable) is inspiration only and must not be deployed.

---

# 2. Core Visual Concept

The chosen visual direction is:

> **Editorial European Route Atlas**

UARoute should visually combine the character of:

- a contemporary travel publication,
- a digital route atlas,
- a European wayfinding system,
- modern Ukrainian editorial design.

The central visual metaphor is:

> **A journey is a line connecting two places.**

The visual language therefore revolves around:

- routes,
- lines,
- waypoints,
- destinations,
- geographic forms,
- atlas-like graphics,
- editorial typography.

---

# 3. Current Approved Direction

The site has been rebuilt in the selected direction.

The current visual treatment uses:

- a warm paper-like background,
- large serif Cyrillic typography,
- schematic atlas graphics,
- typographic route lists,
- restrained photography,
- editorial composition.

The route logic, WhatsApp inquiry flow, analytics and SEO architecture remain unchanged by the visual redesign.

The visual system must continue to support the product strategy and UX architecture rather than introduce a different product concept.

---

# 4. Visual Personality

The agreed visual personality is:

### Editorial

Typography and composition should feel closer to a modern publication or atlas than to a SaaS dashboard.

### Geographic

The visual language should communicate routes, locations and movement.

### Modern

The product should feel contemporary without relying on fashionable SaaS visual effects.

### Ukrainian

The product should have a clear Ukrainian identity, but it should not depend on literal flag imagery.

### Restrained

Visual richness should come from composition, typography, route graphics and photography rather than excessive decoration.

---

# 5. Visual Anti-Patterns

The rejected visual direction was explicitly too similar to a generic AI-generated SaaS interface.

Avoid returning to:

- excessive rounded cards,
- card-heavy layouts,
- giant empty card containers,
- generic blue SaaS buttons,
- purple gradients,
- glassmorphism,
- generic dashboard layouts,
- random decorative illustrations,
- excessive flags,
- unrelated visual styles,
- fake map aesthetics.

Do not treat every block of information as a rounded card.

Cards are a UI mechanism, not the visual identity of the product.

---

# 6. Composition

The visual system favors:

- editorial composition,
- asymmetry,
- large typography,
- generous whitespace,
- structured information,
- route graphics integrated into layouts,
- full-width visual sections where appropriate,
- typographic route lists instead of generic grids.

The homepage direction selected during design exploration is:

> **Asymmetric atlas cover**

This means the homepage should use an editorial, asymmetric composition rather than a centered SaaS hero.

The exact layout should remain consistent with the current approved implementation.

---

# 7. Typography

The selected typography direction is:

> **Instrument Serif + Work Sans**

### Instrument Serif

Use for:

- large editorial headlines,
- major route titles,
- destination names,
- selected large statement typography.

Its role is to provide editorial and travel-publication character.

### Work Sans

Use for:

- body text,
- navigation,
- buttons,
- forms,
- metadata,
- functional UI.

The combination is intentionally based on contrast:

> editorial serif for identity + functional sans-serif for usability.

The typography must work well with Ukrainian Cyrillic.

Representative strings that should remain visually strong include:

> Маршрути з України до Європи

> Львів → Ганновер

> Перед поїздкою уточніть у Koval

> Написати Koval у WhatsApp

---

# 8. Color Direction

The selected palette direction is the first, warm editorial palette.

The visual concept is based on:

- warm paper / off-white background,
- dark ink,
- deep navy,
- restrained blue,
- yellow as a sparse signal accent.

The currently proposed conceptual values discussed for the system were:

```text
Paper / warm background
#F7F5EF

Surface
#FFFFFF

Ink
#151A22

Deep Navy
#203454

Primary Blue
#2F67D8

Signal Yellow
#E8B83A

Muted Text
#697180

Border
#D9DDE3
```

These are design-direction values rather than an immutable final token contract.

The important rule is the relationship between colors:

- warm paper should dominate large backgrounds,
- dark ink should dominate typography,
- blue should be the main interactive/geographic accent,
- yellow should be rare and meaningful.

Do not turn the interface into a literal blue/yellow flag palette.

---

# 9. Route Graphic Language

The signature graphic concept is the route.

A simple conceptual form is:

```text
●──────────────●
origin       destination
```

However, the route line should not be treated as an isolated decorative line.

It is part of a broader visual language containing:

- route lines,
- waypoints,
- destination labels,
- country/corridor notation,
- geographic contours,
- atlas-like composition.

The route graphic should help communicate:

> origin → movement → destination.

---

# 10. Waypoints

Waypoints are one of the recurring visual primitives.

Conceptually:

```text
● Львів
```

or:

```text
◉ Ганновер
```

The exact graphic treatment may vary by context, but waypoint geometry should remain consistent across the product.

Waypoints can appear in:

- route graphics,
- route lists,
- route cards,
- hero compositions,
- empty states,
- future destination treatments.

---

# 11. Route Lists

A major visual pattern is the **numbered typographic route list**.

Example:

```text
01  ЛЬВІВ ───────────── ГАННОВЕР
    UA · PL · DE

02  ЛЬВІВ ───────────── ГАМБУРГ
    UA · PL · DE

03  ЛЬВІВ ───────────── БЕРЛІН
    UA · PL · DE
```

This pattern is preferred over a generic grid of rounded route cards where the route itself becomes visually secondary.

The route is the primary visual object.

---

# 12. Route Capsules / Route Metadata

The product may use concise route metadata such as:

> UA → PL → DE

or:

> Львів → Ганновер

as recurring visual elements.

These should communicate geography and route context without becoming generic pill-style UI.

Use them as typography/metadata elements within the editorial composition.

---

# 13. Geographic Graphics

UARoute should use **schematic geographic graphics**, not generic decorative illustrations.

Potential visual language already discussed includes:

- simplified European geography,
- abstract geographic contours,
- atlas-like lines,
- topographic-inspired shapes,
- route compositions,
- geographic labels.

These graphics should communicate the idea of geography.

They must not pretend to be precise navigation data when they are decorative.

The approved product deliberately avoids a large operational map in Milestone 1.

---

# 14. Photography

Photography should be used selectively.

Preferred direction:

- real transport imagery,
- real Koval vehicles,
- real vehicle interiors,
- real European destinations,
- travel/road environments,
- recognizable places where appropriate.

The visual strategy should not depend on generic stock travel photography.

Real Koval vehicle imagery can be used as a trust-building element within the partner context while preserving UARoute's independent visual identity.

---

# 15. Koval Visual Relationship

UARoute should retain its own visual identity.

Koval should appear as:

> the transport provider / partner

rather than becoming the visual identity of UARoute.

The interface should use UARoute's:

- typography,
- paper background,
- atlas graphics,
- route language,

around Koval content.

Koval's brand should be recognizable but visually contained within the partner context.

---

# 16. Graphic Enrichment Principle

The goal is to make the site visually rich through **information-derived graphics**, not through random decoration.

The preferred principle is:

> **Turn information into graphic language.**

Examples:

Instead of plain:

> Україна → Польща → Німеччина

use a route/corridor graphic.

Instead of a generic route card, use a typographic route composition.

Instead of a generic empty state, use a route that terminates at an unavailable point.

Instead of arbitrary decorative shapes, use geographic or route-derived elements.

Every graphical element should reinforce:

> route / journey / geography / wayfinding.

---

# 17. Graphic Consistency

A graphic element should belong to the same visual family as the rest of the product.

Do not introduce unrelated styles such as:

- one illustration style on the homepage,
- another on route pages,
- another on articles,
- another for error states.

The system should feel like one coherent atlas.

---

# 18. Illustration Direction

A lightweight illustration language has been discussed for future use:

- thin-line / monoline character,
- restrained detail,
- route/geographic subject matter,
- consistent geometry.

Potential subjects include:

- documents,
- border crossing,
- baggage,
- parcel,
- phone,
- route,
- destination.

These are future reusable graphic primitives, not a requirement to create a large illustration library in Milestone 1.

---

# 19. Graphic Dividers

The product may replace generic horizontal rules with small route-derived separators.

Examples:

```text
────────●────────
```

or:

```text
──────→
```

These should be used selectively.

Their purpose is to strengthen the atlas/route identity, not to decorate every section.

---

# 20. Background Graphic Language

Subtle background graphics may include:

- abstract route lines,
- simplified geographic contours,
- atlas patterns,
- geographic metadata.

They should remain subordinate to readable content.

They should never become a visual map that users could mistake for precise routing information.

---

# 21. Motion

A restrained motion language may be used to support the concept of movement.

Possible uses already discussed:

- route line drawing,
- waypoint appearance,
- subtle directional arrow movement,
- search-result transitions.

Motion should remain understated.

Avoid:

- constant movement,
- bouncing objects,
- aggressive parallax,
- excessive scroll effects.

Animations should respect reduced-motion preferences.

---

# 22. Mobile Visual Behavior

The visual identity must survive on mobile.

Graphical compositions should simplify rather than disappear.

For example:

### Desktop

May show:

- multiple geographic labels,
- large contour graphics,
- complex route composition.

### Mobile

Should simplify to:

- route line,
- origin,
- destination,
- essential metadata.

The mobile layout must prioritize:

1. route,
2. useful content,
3. inquiry action.

Decorative graphics must not consume excessive vertical space.

---

# 23. Component Visual Philosophy

The design system should not be interpreted as:

> everything becomes a card.

Use different visual forms for different information types:

### Editorial content

Typography + whitespace.

### Routes

Typographic lists + route lines.

### Geographic context

Atlas graphics.

### Metadata

Small labels + strong values.

### Conversion

Focused UI surface.

### Partner

Contained visual module.

The visual form should reflect the information's role.

---

# 24. Visual Hierarchy

The visual hierarchy should generally be:

### Primary

- route,
- destination,
- major editorial message,
- inquiry action.

### Secondary

- practical information,
- carrier,
- related routes.

### Tertiary

- metadata,
- verification/source information.

The user should always know what the page is about within seconds.

---

# 25. Verification Visual Language

Because factual trust is strategically important, verified information may eventually receive a subtle treatment such as:

> ✓ Перевірено · вересень 2026

or:

> Джерело: Koval

Only use verification language when the underlying content has actual source/provenance data.

Do not use "verified" as a decorative badge.

---

# 26. 404 / Empty / Loading Visual Language

These states should belong to the same atlas system.

### Empty

A route ending without a destination.

### 404

A route that has been lost or cannot be found.

### Loading

A route line progressing between points.

These should feel like part of UARoute rather than generic framework states.

---

# 27. Logo / Wordmark Direction

The UARoute wordmark should support the route/atlas identity.

The route-line idea may inform the logo, but the logo should not be reduced to a generic:

> two dots + line

icon.

The identity should work in:

- header,
- mobile,
- favicon,
- social/share contexts.

The final logo treatment remains subject to visual refinement.

---

# 28. Social / Share Graphics

The route visual system should eventually support route-specific social images.

Conceptually:

```text
UARoute

Львів → Ганновер

UA → PL → DE

●────────────────●
```

This is a future extension of the same design system rather than a separate social identity.

---

# 29. Performance Principle

Graphic richness must not come at the expense of the product's performance.

Prefer lightweight vector graphics where appropriate.

Use real raster images for photography.

Avoid unnecessary heavy visual dependencies.

The product should remain fast on mobile.

---

# 30. Accessibility Principle

Decorative graphics must not interfere with accessibility.

Use appropriate decorative/semantic handling for SVGs and images.

Visual meaning should also be available through textual content when it represents actual information.

Do not use color as the only method of communicating status.

Maintain readable contrast.

---

# 31. Design System Boundaries

This document records the visual direction and principles currently known.

It does not yet define all final:

- token values,
- spacing dimensions,
- component variants,
- icon set,
- illustration library,
- animation timings,
- photography library.

Those should be added only when intentionally designed and approved.

Do not invent additional visual rules under the assumption that they are already decided.

---

# 32. Design Review Criteria

A future UARoute screen should be considered visually aligned when:

### Identity

It feels like the same UARoute visual world.

### Editorial quality

Typography and composition provide a publication/atlas character.

### Geography

Route and geographic language is visible where relevant.

### Restraint

The screen is visually rich without becoming noisy.

### Hierarchy

The route and user action remain clear.

### Independence

The screen looks like UARoute, not like a Koval clone.

### Consistency

Graphics, typography and composition belong to one system.

### Truthfulness

Decorative geography never pretends to be precise operational navigation.

---

# 33. Current Visual North Star

The visual north star is:

> **UARoute should feel like a contemporary digital atlas of journeys from Ukraine to Europe.**

The product should communicate:

**origin → route → destination → next action**

through typography, composition and graphic language.

The visual system should make the concept of the journey visible without turning the product into a literal map application or a generic travel website.
