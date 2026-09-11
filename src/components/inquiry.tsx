"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { ResolvedRoute } from "@/data/queries";
import { track } from "@/lib/analytics";
import { buildInquiryTarget, createLeadId, resolveDesk, validateInquiry } from "@/lib/whatsapp";

type Errors = {
  travelDate?: string | undefined;
  phone?: string | undefined;
  passengers?: string | undefined;
};

type InquiryState = {
  route: ResolvedRoute;
  travelDate: string;
  phone: string;
  passengers: number;
  errors: Errors;
  setTravelDate: (value: string) => void;
  setPhone: (value: string) => void;
  setPassengers: (value: number) => void;
  submit: (ctaLocation: "booking_widget" | "sticky_mobile") => void;
};

const InquiryContext = createContext<InquiryState | null>(null);

export function InquiryProvider({
  route,
  children,
}: {
  route: ResolvedRoute;
  children: ReactNode;
}) {
  const [travelDate, setTravelDate] = useState("");
  const [phone, setPhone] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [errors, setErrors] = useState<Errors>({});

  const submit = useCallback(
    (ctaLocation: "booking_widget" | "sticky_mobile") => {
      const validation = validateInquiry({ travelDate, phone, passengers });
      if (!validation.ok) {
        setErrors(validation.errors);
        const firstField = document.getElementById(
          validation.errors.travelDate ? "inquiry-date" : "inquiry-phone",
        );
        firstField?.scrollIntoView({ behavior: "smooth", block: "center" });
        firstField?.focus({ preventScroll: true });
        return;
      }

      setErrors({});
      const leadId = createLeadId();
      const desk = resolveDesk(route);
      const target = buildInquiryTarget({ route, travelDate, phone, passengers }, leadId);

      const context = {
        routeSlug: route.slug,
        origin: route.origin.slug,
        destination: route.destination.slug,
        destinationCountry: route.destination.country,
        travelDate,
        passengerCount: passengers,
        ctaLocation,
        leadId,
        ...(desk ? { deskId: desk.id } : {}),
      } as const;

      track("booking_intent", {
        ...context,
        conversionType: target.kind === "whatsapp" ? "whatsapp_inquiry" : "koval_site",
      });
      track(target.kind === "whatsapp" ? "whatsapp_click" : "koval_site_click", {
        ...context,
        conversionType: target.kind === "whatsapp" ? "whatsapp_inquiry" : "koval_site",
      });

      window.open(target.url, "_blank", "noopener,noreferrer");
    },
    [route, travelDate, phone, passengers],
  );

  const value = useMemo<InquiryState>(
    () => ({
      route,
      travelDate,
      phone,
      passengers,
      errors,
      setTravelDate: (next: string) => {
        setTravelDate(next);
        setErrors((current) => ({ ...current, travelDate: undefined }));
      },
      setPhone: (next: string) => {
        setPhone(next);
        setErrors((current) => ({ ...current, phone: undefined }));
      },
      setPassengers,
      submit,
    }),
    [route, travelDate, phone, passengers, errors, submit],
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry(): InquiryState {
  const context = useContext(InquiryContext);
  if (!context) throw new Error("useInquiry must be used inside InquiryProvider");
  return context;
}
