---
type: "Decision"
title: "ADR 0002 — Gated operator booking pilot"
description: "Architectural decision, scope and consequences; migration does not change its accepted status."
tags: ["uaroute", "decision"]
---

# ADR 0002 — Gated operator booking pilot

**Status:** Accepted development direction; live booking is not released  
**Date:** 2026-10-01  
**Authorization:** The product owner selected “UARoute, with a gated booking pilot” and requested autonomous strategy and site updates.  
**Scope:** UARoute M2; M1 remains a static route-discovery and WhatsApp inquiry flow.

## Context

The owner chose Next.js SSG, S3, and Lambda, with DynamoDB only where justified. The minibus POC described in the supplied project note is a workflow reference, not a verified component of this repository. This decision does not certify its implementation or import sample trips into UARoute's catalog.

The previous absolute discovery-only boundary prevented an operator-controlled reservation pilot. This product decision changes that future boundary explicitly, while preserving the distinction between a current WhatsApp inquiry and a future committed reservation.

## Decision

- Keep Next.js App Router static export, `trailingSlash: true`, S3, and CloudFront. ADR 0001 continues to govern the frontend; no Next.js request-time server or server actions are introduced.
- Add an API Gateway HTTP API and a small Node.js Lambda application for the pilot. One shared booking service owns all capacity-changing operations. Separate functions only for an actual operational need.
- Introduce DynamoDB before accepting real reservations: concurrent Lambda environments need shared durable inventory and atomic conditional writes. Use simple trip and booking records; do not build speculative fleet/cargo models or a universal data-access framework.
- Use Cognito for provisioned operator/driver accounts and API Gateway JWT validation. Lambda still enforces operator and assigned-trip authorization. Passengers remain guests.
- No interim production Express/SQLite deployment, planned Postgres migration, SSR host, Kubernetes, EFS-backed SQLite, or home-built S3 database.
- Next.js pages are static shells; the browser loads live departures and availability from the API. Creating a departure must not require a site build.
- Enable booking only for a verified operator, commercial corridor, and explicitly enrolled scheduled trip. Commercial catalog status alone does not enable booking. Non-enrolled routes retain their inquiry flow.
- UARoute may confirm a committed seat reservation only after a successful inventory transaction. The operator owns schedules, service facts, customer support, and transport fulfillment. An inquiry, click, or ambiguous timeout is never confirmation.
- The eight-seat limit applies to the pilot's verified passenger capacity, not an assertion about Koval's existing vehicles. Self-booking permits 1–3 seats; authenticated driver entry permits 1–8, always limited by remaining capacity.

## Release gates

Before enabling reservations: accepted operator agreement, one authoritative roster including phone bookings, verified trip details and eight-seat capacity, published privacy/retention terms, tested authentication and authorization, atomic booking/cancellation and durable idempotency, cutoff/DST tests, recovery rehearsal, cost/support ownership, and measured baseline. No operator agreement, inventory feed, or deployment is established by this ADR.

M1 inquiry data remains transient. M2 stores only the passenger name and phone needed for a reservation, plus necessary trip/booking metadata, in private storage under a defined deletion policy. Personal data, selected dates, receipt credentials, and messages never enter analytics, static output, public URLs, logs, or the repository.

## Consequences

There is one gated addition of live storage, not a sequence of technical migrations. AWS reduces VM operations but requires IAM, identity configuration, monitoring, recovery, and distributed-request tests. Developer time and support remain real costs; no free-tier or fixed monthly price is assumed.

The [booking development strategy](../knowledge-base.md#knowledge-base) (KB: `wiki/Product/13-booking-pilot-development-strategy.md`) owns sequencing and economics. The [booking site specification](../knowledge-base.md#knowledge-base) (KB: `wiki/Product/14-booking-pilot-site-details.md`) owns page behavior and release states. Existing M1 specifications describe the inquiry mode and must not be used as prohibitions on this explicitly approved M2 scope.

## Sources

- [Next.js static export](https://nextjs.org/docs/app/guides/static-exports)
- [Lambda concurrency](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html)
- [DynamoDB atomic transaction API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html)
- [API Gateway JWT authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html)
- [S3 conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html): possible at object level, but not the chosen reservation design.
