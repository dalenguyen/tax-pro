export interface ApiKey {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

/** Returned only once at creation — never stored in plaintext */
export interface ApiKeyCreated extends ApiKey {
  plaintext: string;
}
