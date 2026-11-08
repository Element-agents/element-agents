import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/menu";

export const messages = {
  "menu.stopAllAgents": "Parar todos os agentes",
  "menu.checkForUpdates": "Buscar atualizações…",
  "menu.preferences": "Configurações…",
  "menu.actualSize": "Tamanho real",
  "menu.zoomIn": "Ampliar",
  "menu.zoomOut": "Reduzir",
  "menu.copyLink": "Copiar link",
  "menu.quit": "Sair do Element",
  "menu.quitConfirmTitle": "Sair do Element?",
  "menu.quitConfirmBody": "Os agentes e as rotinas param até você abrir o Element de novo.",
  "menu.quitConfirm": "Sair",
  "menu.quitHint": "Mantenha ⌘Q pressionado ou pressione duas vezes para sair",
  "menu.trayOpen": "Abrir o Element",
  "menu.trayQuit": "Sair do Element",
  "menu.trayTooltip": "Element",
  "menu.undo": "Desfazer",
  "menu.redo": "Refazer",
  "menu.cut": "Recortar",
  "menu.copy": "Copiar",
  "menu.paste": "Colar",
  "menu.pasteAndMatchStyle": "Colar e manter estilo",
  "menu.delete": "Excluir",
  "menu.selectAll": "Selecionar tudo",
} as const satisfies PartialTranslation<typeof source>;
