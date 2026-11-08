import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Element kan niet starten",
  "startup.failedBody":
    "{message}\n\nJe lokale gegevens zijn niet gereset of overschreven. Bekijk de handleiding voor probleemoplossing voor herstelstappen.",
  "startup.archiveChangedTitle": "Element-bestanden zijn gewijzigd",
  "startup.archiveChangedBody":
    "Een ander programma heeft het Element-bestand app.asar gewijzigd. Element werkt nu, maar opent niet meer nadat je het afsluit.\n\nInstalleer Element opnieuw om het te herstellen. Je lokale gegevens blijven bewaard.",
  "startup.archiveChangedDownload": "Element downloaden",
  "startup.newerDataUpdatingTitle": "Element wordt bijgewerkt",
  "startup.newerDataUpdatingBody":
    "Een nieuwere versie van Element heeft je gegevens opgeslagen. Element installeert de nieuwste versie en opent daarna opnieuw.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataTitle": "Installeer de nieuwste Element",
  "startup.newerDataBody":
    "Een nieuwere versie van Element heeft je gegevens opgeslagen, en deze versie ({version}) kan ze niet openen. Installeer de nieuwste versie om je gegevens te openen.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataDownload": "Element downloaden",
  "startup.newerDataGuide": "Gids openen",
  "startup.newerDataQuit": "Stoppen",
} as const satisfies PartialTranslation<typeof source>;
