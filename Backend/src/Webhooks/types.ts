export type WebhookSupportedEvent =
    | "purchase.completed"
    | "license.granted"
    | "license.revoked"
    | "game.certified"
    | "game.rejected"
    | "review.created";

export interface WebhookPayload<T = Record<string, any>> {
    id: string; // Event UUID
    event: WebhookSupportedEvent;
    createdAt: string; // ISO String
    data: T;
}

export interface WebhookDispatchResult {
    queuedCount: number;
    subscriptions: string[];
}

