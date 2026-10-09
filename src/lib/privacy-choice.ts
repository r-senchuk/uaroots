/** Browser preference only: never a passenger identifier or analytics event. */
export const privacyChoiceKey = "uaroute:privacy-choice:v2";
export const legacyPrivacyChoiceKey = "uaroute:analytics-choice:v1";
export const privacyNoticeVersion = "2026-10-07";
export const privacyChoiceLifetime = 180 * 24 * 60 * 60 * 1000;
export type PrivacyChoice = {
  version: typeof privacyNoticeVersion;
  analytics: boolean;
  advertising: false;
  chosenAt: number;
  expiresAt: number;
};
export function createPrivacyChoice(analytics: boolean, now = Date.now()): PrivacyChoice {
  return { version: privacyNoticeVersion, analytics, advertising: false, chosenAt: now, expiresAt: now + privacyChoiceLifetime };
}
export function parsePrivacyChoice(value: string | null, now = Date.now()): PrivacyChoice | null {
  if (!value) return null;
  try {
    const choice = JSON.parse(value) as Partial<PrivacyChoice> | null;
    if (!choice || choice.version !== privacyNoticeVersion || typeof choice.analytics !== "boolean" || choice.advertising !== false ||
      typeof choice.chosenAt !== "number" || typeof choice.expiresAt !== "number" ||
      !Number.isFinite(choice.chosenAt) || !Number.isFinite(choice.expiresAt) ||
      choice.chosenAt > now || choice.expiresAt <= now || choice.expiresAt !== choice.chosenAt + privacyChoiceLifetime) return null;
    return choice as PrivacyChoice;
  } catch { return null; }
}
