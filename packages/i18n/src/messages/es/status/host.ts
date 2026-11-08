import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  "status.host.registered": "Se registró este Element para el acceso WebRTC.",
  "status.host.keyRotated": "Clave del servidor cambiada. Los dispositivos vinculados siguen vinculados.",
  "status.host.identityUpdated": "Identidad del servidor actualizada.",
  "status.host.starting": "Iniciando el host WebRTC…",
  "status.host.ready": "Este Element está listo para conexiones WebRTC.",
  "status.host.stopping": "Haciendo privado este Element…",
  "status.host.private": "Este Element es privado.",
} as const satisfies PartialTranslation<typeof source>;
