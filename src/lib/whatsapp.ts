import { absoluteUrl, withUtm } from "@/config/site";
import { getCarrier, getDesk } from "@/data/carriers";
import type { ResolvedRoute } from "@/data/queries";
import type { Desk } from "@/data/types";

export type InquiryInput = {
  route: ResolvedRoute;
  /** ISO date string from the date input (YYYY-MM-DD). Required. */
  travelDate: string;
  /** Contact phone, used only to compose the message. Never stored or tracked. */
  phone: string;
  passengers: number;
};

export type InquiryValidation =
  | { ok: true }
  | { ok: false; errors: { travelDate?: string; phone?: string; passengers?: string } };

export function validateInquiry(input: {
  travelDate: string;
  phone: string;
  passengers: number;
}): InquiryValidation {
  const errors: { travelDate?: string; phone?: string; passengers?: string } = {};

  if (!input.travelDate) {
    errors.travelDate = "Вкажіть дату поїздки.";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const travel = new Date(`${input.travelDate}T00:00:00`);
    if (Number.isNaN(travel.getTime()) || travel < today) {
      errors.travelDate = "Дата не може бути в минулому.";
    }
  }

  const digits = input.phone.replace(/\D/g, "");
  if (!input.phone.trim()) {
    errors.phone = "Вкажіть номер телефону для зв'язку.";
  } else if (digits.length < 9) {
    errors.phone = "Схоже, номер неповний. Перевірте, будь ласка.";
  }

  if (!Number.isInteger(input.passengers) || input.passengers < 1 || input.passengers > 8) {
    errors.passengers = "Кількість пасажирів: від 1 до 8.";
  }

  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}

/** Ephemeral inquiry code. Not persisted anywhere — no lead database exists. */
export function createLeadId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `UR-${code}`;
}

/** Resolves the desk that handles a route. Undefined means: fall back to the website. */
export function resolveDesk(route: ResolvedRoute): Desk | undefined {
  const carrierId = route.carrierIds[0];
  if (!carrierId) return undefined;
  return getDesk(carrierId, route.deskId);
}

export function formatTravelDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

export function buildInquiryMessage(input: InquiryInput, leadId: string): string {
  const { route, travelDate, phone, passengers } = input;
  const lines = [
    "Добрий день! Хочу уточнити поїздку (заявка, не підтверджене бронювання).",
    "",
    `Маршрут: ${route.origin.name} → ${route.destination.name}`,
    `Дата: ${formatTravelDate(travelDate)}`,
    `Пасажирів: ${passengers}`,
    `Телефон: ${phone.trim()}`,
    "",
    "Джерело: UARoute",
    `Сторінка: ${absoluteUrl(`/routes/${route.slug}/`)}`,
    `Код: ${leadId}`,
  ];
  return lines.join("\n");
}

export type InquiryTarget =
  | { kind: "whatsapp"; url: string; desk: Desk; leadId: string }
  | { kind: "website"; url: string; leadId: string };

/**
 * Builds the destination for a validated inquiry. When no verified desk exists
 * for the route, falls back to the carrier website instead of producing a
 * broken wa.me link.
 */
export function buildInquiryTarget(input: InquiryInput, leadId: string): InquiryTarget {
  const desk = resolveDesk(input.route);
  if (desk && /^\d{8,15}$/.test(desk.whatsapp)) {
    const message = buildInquiryMessage(input, leadId);
    return {
      kind: "whatsapp",
      url: `https://wa.me/${desk.whatsapp}?text=${encodeURIComponent(message)}`,
      desk,
      leadId,
    };
  }

  const carrier = getCarrier(input.route.carrierIds[0] ?? "");
  return {
    kind: "website",
    url: carrier ? withUtm(carrier.website, `${input.route.slug}_inquiry_fallback`) : "/",
    leadId,
  };
}
