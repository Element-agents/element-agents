import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/menu";

export const messages = {
  "menu.stopAllAgents": "Detener todos los agentes",
  "menu.checkForUpdates": "Buscar actualizaciones…",
  "menu.preferences": "Ajustes…",
  "menu.actualSize": "Tamaño real",
  "menu.zoomIn": "Ampliar",
  "menu.zoomOut": "Reducir",
  "menu.copyLink": "Copiar enlace",
  "menu.quit": "Salir de Element",
  "menu.quitConfirmTitle": "¿Salir de Element?",
  "menu.quitConfirmBody": "Los agentes y las rutinas se detienen hasta que vuelvas a abrir Element.",
  "menu.quitConfirm": "Salir",
  "menu.quitHint": "Mantén pulsado ⌘Q o púlsalo dos veces para salir",
  "menu.trayOpen": "Abrir Element",
  "menu.trayQuit": "Salir de Element",
  "menu.trayTooltip": "Element",
  "menu.undo": "Deshacer",
  "menu.redo": "Rehacer",
  "menu.cut": "Cortar",
  "menu.copy": "Copiar",
  "menu.paste": "Pegar",
  "menu.pasteAndMatchStyle": "Pegar y adaptar estilo",
  "menu.delete": "Eliminar",
  "menu.selectAll": "Seleccionar todo",
} as const satisfies PartialTranslation<typeof source>;
