import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/messaging";

export const messages = {
  "messaging.help.invalid_token":
    "Slack akzeptiert Element in diesem Arbeitsbereich nicht mehr. Es wurde möglicherweise deinstalliert. Verbinde den Arbeitsbereich erneut.",
  "messaging.help.secret_storage_unavailable":
    "Element kann die gespeicherten Tokens auf diesem Computer nicht lesen. Trenne den Arbeitsbereich und verbinde ihn erneut.",
  "messaging.help.relay_unavailable":
    "Element kann auf diesem Computer keine Slack-Ereignisse empfangen. Melde dich an, gib diesem Computer in den Servereinstellungen einen Namen und lass Element geöffnet.",
  "messaging.discordHelp.invalid_token":
    "Discord akzeptiert Element auf diesem Discord-Server nicht mehr. Es wurde möglicherweise entfernt. Verbinde den Discord-Server erneut.",
  "messaging.discordHelp.secret_storage_unavailable":
    "Element kann die gespeicherten Tokens auf diesem Computer nicht lesen. Trenne den Discord-Server und verbinde ihn erneut.",
  "messaging.discordHelp.relay_unavailable":
    "Element kann auf diesem Computer keine Discord-Ereignisse empfangen. Melde dich an, gib diesem Computer in den Servereinstellungen einen Namen und lass Element geöffnet.",
} as const satisfies PartialTranslation<typeof source>;
