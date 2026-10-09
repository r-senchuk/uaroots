import { getReferralContract } from "@/config/site";

export const dynamic = "force-static";

/** Exported JSON file; no request-time service or visitor data. */
export function GET() {
  return Response.json(getReferralContract());
}
