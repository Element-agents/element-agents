import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Element non è riuscito ad avviarsi",
  "startup.failedBody":
    "{message}\n\nI tuoi dati locali non sono stati reimpostati né sovrascritti. Consulta la guida alla risoluzione dei problemi per i passaggi di ripristino.",
  "startup.archiveChangedTitle": "I file di Element sono stati modificati",
  "startup.archiveChangedBody":
    "Un altro programma ha modificato il file app.asar di Element. Element ora funziona, ma non si aprirà più dopo la chiusura.\n\nPer ripararlo, installa di nuovo Element. I tuoi dati locali restano.",
  "startup.archiveChangedDownload": "Scarica Element",
  "startup.newerDataUpdatingTitle": "Aggiornamento di Element",
  "startup.newerDataUpdatingBody":
    "Una versione più recente di Element ha salvato i tuoi dati. Element installa l’ultima versione e poi si riapre.\n\nI tuoi dati locali non sono stati reimpostati né sovrascritti.",
  "startup.newerDataTitle": "Installa l’ultima versione di Element",
  "startup.newerDataBody":
    "Una versione più recente di Element ha salvato i tuoi dati e questa versione ({version}) non può aprirli. Installa l’ultima versione per aprire i tuoi dati.\n\nI tuoi dati locali non sono stati reimpostati né sovrascritti.",
  "startup.newerDataDownload": "Scarica Element",
  "startup.newerDataGuide": "Apri guida",
  "startup.newerDataQuit": "Esci",
} as const satisfies PartialTranslation<typeof source>;
