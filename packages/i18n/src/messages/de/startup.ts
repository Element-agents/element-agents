import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Element konnte nicht starten",
  "startup.failedBody":
    "{message}\n\nDeine lokalen Daten wurden weder zurückgesetzt noch überschrieben. Schritte zur Wiederherstellung findest du in der Anleitung zur Fehlerbehebung.",
  "startup.archiveChangedTitle": "Element-Dateien wurden geändert",
  "startup.archiveChangedBody":
    "Ein anderes Programm hat die Element-Datei app.asar geändert. Element läuft jetzt, startet aber nicht mehr, wenn du es beendest.\n\nInstalliere Element erneut, um es zu reparieren. Deine lokalen Daten bleiben erhalten.",
  "startup.archiveChangedDownload": "Element laden",
  "startup.newerDataUpdatingTitle": "Element wird aktualisiert",
  "startup.newerDataUpdatingBody":
    "Eine neuere Version von Element hat deine Daten gespeichert. Element installiert die neueste Version und startet dann neu.\n\nDeine lokalen Daten wurden nicht zurückgesetzt oder überschrieben.",
  "startup.newerDataTitle": "Neueste Element-Version installieren",
  "startup.newerDataBody":
    "Eine neuere Version von Element hat deine Daten gespeichert, und diese Version ({version}) kann sie nicht öffnen. Installiere die neueste Version, um deine Daten zu öffnen.\n\nDeine lokalen Daten wurden nicht zurückgesetzt oder überschrieben.",
  "startup.newerDataDownload": "Element laden",
  "startup.newerDataGuide": "Anleitung öffnen",
  "startup.newerDataQuit": "Beenden",
} as const satisfies PartialTranslation<typeof source>;
