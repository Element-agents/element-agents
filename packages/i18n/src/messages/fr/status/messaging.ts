import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/messaging";

export const messages = {
  "status.messaging.working": "En cours…",
  "status.messaging.queued": "En attente : Element traite une autre demande. La réponse arrivera ici.",
  "status.messaging.busy": "Trop de demandes sont en attente. Réessayez plus tard.",
  "status.messaging.failed": "Element n’a pas pu terminer cette demande. L’hôte Element dispose des détails.",
  "status.messaging.noAnswer": "Element a terminé sans réponse écrite.",
  "status.messaging.noAgent": "Aucun agent ne peut encore répondre ici. Ajoutez l’Orchestrateur Slack dans Element.",
  "status.messaging.delegated": "Un coéquipier s’en occupe. La réponse arrivera ici.",
  "status.messaging.stopped": "Arrêté.",
  "status.messaging.stop": "Arrêter",
  "status.messaging.approvalTitle": "Element demande une approbation pour continuer.",
  "status.messaging.approvalCommand": "Exécuter une commande",
  "status.messaging.approvalFileChange": "Modifier des fichiers",
  "status.messaging.approvalPermissions": "Obtenir plus d’autorisations",
  "status.messaging.approve": "Approuver",
  "status.messaging.deny": "Refuser",
  "status.messaging.approvedBy": "Approuvé par {user}.",
  "status.messaging.deniedBy": "Refusé par {user}.",
  "status.messaging.answeredOnHost": "Réponse donnée sur l’hôte Element.",
  "status.messaging.requestInactive": "Cette demande n’est plus active.",
  "status.messaging.onlyRequester": "Seul {user} peut faire cela. L’hôte Element peut aussi répondre.",
  "status.messaging.hostOnly": "Seul l’hôte Element peut répondre à cette demande.",
  "status.messaging.filesSkipped": "Certains fichiers n’ont pas été envoyés : {names}.",
  "status.messaging.orchestratorName": "Orchestrateur Slack",
  "status.messaging.orchestratorTitle": "Répond dans Slack et consulte l’équipe",
  "status.messaging.discordNoAgent":
    "Aucun agent ne peut encore répondre ici. Ajoutez l’Orchestrateur Discord dans Element.",
  "status.messaging.discordOrchestratorName": "Orchestrateur Discord",
  "status.messaging.discordOrchestratorTitle": "Répond dans Discord et consulte l’équipe",
  "status.messaging.integrationsSection": "Intégrations",
  "status.messaging.signInReceived": "Element a reçu l’installation Slack. Vous pouvez fermer cet onglet.",
  "status.messaging.signInUnknown": "Element n’a pas lancé cette installation Slack. Relancez-la dans Element.",
  "status.messaging.telegramNoAgent":
    "Aucun agent ne peut encore répondre ici. Ajoutez l’Orchestrateur Telegram dans Element.",
  "status.messaging.telegramLinked":
    "Element est connecté à cette discussion. Mentionnez {bot} ou répondez à un message d’Element pour solliciter les agents.",
  "status.messaging.telegramOrchestratorName": "Orchestrateur Telegram",
  "status.messaging.telegramOrchestratorTitle": "Répond dans Telegram et consulte l’équipe",
  "status.messaging.whatsappNoAgent":
    "Aucun agent ne peut encore répondre ici. Ajoutez l’Orchestrateur WhatsApp dans Element.",
  "status.messaging.whatsappApprovalMenu": "Répondez 1 pour approuver ou 2 pour refuser.",
  "status.messaging.whatsappStopMenu": "Répondez « stop » pour arrêter.",
  "status.messaging.whatsappPairingCode":
    "Ce numéro répond uniquement aux personnes autorisées par son propriétaire. Donnez ce code au propriétaire : {code}",
  "status.messaging.whatsappPairingApproved": "Vous pouvez maintenant envoyer des demandes à ce numéro.",
  "status.messaging.whatsappOwnChat": "Message à vous-même",
  "status.messaging.whatsappWelcomeOwn":
    "👋 *Element est connecté*\n\nÉcrivez ici pour poser vos questions à vos agents. Le WhatsApp Orchestrator répond, ou confie le travail au bon agent.\n\nEnvoyez *stop* pour arrêter une demande.",
  "status.messaging.whatsappWelcomeDedicated":
    "👋 *OpenBot est connecté*\n\nLes personnes que vous autorisez dans OpenBot peuvent maintenant écrire à ce numéro. Une nouvelle personne reçoit un code : approuvez-le dans Element, sous Demandes.\n\nEnvoyez *stop* pour arrêter une demande.",
  "status.messaging.whatsappOrchestratorName": "Orchestrateur WhatsApp",
  "status.messaging.whatsappOrchestratorTitle": "Répond dans WhatsApp et consulte l’équipe",
} as const satisfies PartialTranslation<typeof source>;
