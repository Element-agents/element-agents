import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "O Element não conseguiu iniciar",
  "startup.failedBody":
    "{message}\n\nSeus dados locais não foram redefinidos nem sobrescritos. Consulte o guia de solução de problemas para ver os passos de recuperação.",
  "startup.archiveChangedTitle": "Arquivos do Element foram alterados",
  "startup.archiveChangedBody":
    "Outro programa alterou o arquivo app.asar do Element. O Element funciona agora, mas não vai abrir depois que você fechá-lo.\n\nPara reparar, instale o Element novamente. Seus dados locais são mantidos.",
  "startup.archiveChangedDownload": "Baixar Element",
  "startup.newerDataUpdatingTitle": "Atualizando o Element",
  "startup.newerDataUpdatingBody":
    "Uma versão mais recente do Element salvou seus dados. O Element instala a versão mais recente e depois abre de novo.\n\nSeus dados locais não foram redefinidos nem substituídos.",
  "startup.newerDataTitle": "Instale o Element mais recente",
  "startup.newerDataBody":
    "Uma versão mais recente do Element salvou seus dados, e esta versão ({version}) não consegue abri-los. Instale a versão mais recente para abrir seus dados.\n\nSeus dados locais não foram redefinidos nem substituídos.",
  "startup.newerDataDownload": "Baixar Element",
  "startup.newerDataGuide": "Abrir guia",
  "startup.newerDataQuit": "Sair",
} as const satisfies PartialTranslation<typeof source>;
