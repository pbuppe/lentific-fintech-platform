/**
 * packages/documents : vault documentaire (§11, §12). Stockage objet
 * compatible S3 (Cloudflare R2), même logique d'interface interchangeable
 * que le KYC : ce module ne connaît que "storageKey", pas le prestataire.
 */
import { documentsRepo, documentRequestsRepo, storedFilesRepo, type DocumentStatus } from "@fintech/database";
import { emit } from "@fintech/workflow";

export interface StorageAdapter {
  upload(fileName: string, content: Buffer | Uint8Array): Promise<{ storageKey: string }>;
  getSignedUrl(storageKey: string): Promise<string>;
}

/**
 * À remplacer par l'adapter Cloudflare R2 (ou tout compatible S3) avant tout
 * usage en production réelle. En attendant, les fichiers sont stockés dans
 * Postgres (table StoredFile) plutôt que sur disque : un disque local ne
 * survit pas d'une requête à l'autre sur un hébergement serverless (Vercel),
 * alors que la base de données, elle, est déjà accessible depuis n'importe
 * où (§ déploiement de démonstration).
 */
export const dbStorageAdapter: StorageAdapter = {
  async upload(fileName, content) {
    const storageKey = `db/${Date.now()}-${fileName}`;
    await storedFilesRepo.create(storageKey, Buffer.from(content));
    return { storageKey };
  },
  async getSignedUrl(storageKey) {
    return `/api/documents/${encodeURIComponent(storageKey)}`;
  },
};

/** Lit le contenu d'un fichier stocké, utilisé par la route qui le sert. */
export async function readStoredFile(storageKey: string): Promise<Buffer> {
  const file = await storedFilesRepo.findByKey(storageKey);
  if (!file) throw new Error("Document introuvable.");
  return Buffer.from(file.content);
}

let activeStorage: StorageAdapter = dbStorageAdapter;

export function setStorageAdapter(adapter: StorageAdapter) {
  activeStorage = adapter;
}

/** Dépose un fichier via l'adapter actif sans créer d'entrée Document, utilisé par packages/contracts. */
export async function uploadRaw(fileName: string, content: Buffer | Uint8Array) {
  return activeStorage.upload(fileName, content);
}

export async function getFileUrl(storageKey: string) {
  return activeStorage.getSignedUrl(storageKey);
}

export async function uploadDocument(input: {
  ownerId: string;
  applicationId?: string;
  type: string;
  fileName: string;
  content: Buffer | Uint8Array;
}) {
  const { storageKey } = await activeStorage.upload(input.fileName, input.content);
  return documentsRepo.create({
    ownerId: input.ownerId,
    applicationId: input.applicationId,
    type: input.type,
    storageKey,
  });
}

export function setDocumentStatus(documentId: string, status: DocumentStatus) {
  return documentsRepo.setStatus(documentId, status);
}

export function listApplicationDocuments(applicationId: string) {
  return documentsRepo.listForApplication(applicationId);
}

// ---------------------------------------------------------------------------
// Demandes de documents (§ super administrateur : pouvoir d'action sur un
// compte) : un agent/super administrateur demande une pièce précise à un
// emprunteur ou investisseur, qui n'a plus qu'à l'uploader en réponse.
// ---------------------------------------------------------------------------

export async function requestDocument(input: {
  targetUserId: string;
  requestedById: string;
  label: string;
  instructions?: string;
}) {
  const request = await documentRequestsRepo.create(input);
  await emit("document.requested", {
    requestId: request.id,
    targetUserId: input.targetUserId,
    label: input.label,
  });
  return request;
}

export async function fulfillDocumentRequest(input: {
  requestId: string;
  ownerId: string;
  fileName: string;
  content: Buffer | Uint8Array;
}) {
  const request = await documentRequestsRepo.findById(input.requestId);
  if (!request) throw new Error("Demande de document introuvable.");
  if (request.targetUserId !== input.ownerId) throw new Error("Cette demande ne concerne pas ce compte.");

  const document = await uploadDocument({
    ownerId: input.ownerId,
    type: `requested:${request.label}`,
    fileName: input.fileName,
    content: input.content,
  });
  const updated = await documentRequestsRepo.fulfill(input.requestId, document.id);
  await emit("document.request_fulfilled", {
    requestId: input.requestId,
    targetUserId: input.ownerId,
    documentId: document.id,
  });
  return updated;
}

export function cancelDocumentRequest(requestId: string) {
  return documentRequestsRepo.cancel(requestId);
}

export function listMyDocumentRequests(userId: string) {
  return documentRequestsRepo.listForUser(userId);
}

export function listAllDocumentRequests() {
  return documentRequestsRepo.listAll();
}
