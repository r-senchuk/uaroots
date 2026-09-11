import type { Metadata } from "next";

import { PermanentRedirect } from "@/components/PermanentRedirect";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function GalleryRedirect() {
  return <PermanentRedirect href="/" />;
}
