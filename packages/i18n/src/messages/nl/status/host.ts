import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  "status.host.registered": "Deze Element is geregistreerd voor WebRTC-toegang.",
  "status.host.keyRotated": "Serversleutel gewijzigd. Gekoppelde apparaten blijven gekoppeld.",
  "status.host.identityUpdated": "Serveridentiteit bijgewerkt.",
  "status.host.starting": "WebRTC-host starten…",
  "status.host.ready": "Deze Element is klaar voor WebRTC-verbindingen.",
  "status.host.stopping": "Deze Element privé maken…",
  "status.host.private": "Deze Element is privé.",
} as const satisfies PartialTranslation<typeof source>;
