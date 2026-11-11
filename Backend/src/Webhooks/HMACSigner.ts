import crypto from "node:crypto";

/**
 * Enterprise HMAC-SHA256 Cryptographic Request Signer
 * Implements standard Stripe/GitHub webhook signature protocol
 */
export class HMACSigner {
    private static readonly SIGNATURE_VERSION = "v1";

    /**
     * Generate a high-entropy secret key for a webhook endpoint
     * Format: whsec_<48-hex-chars>
     */
    public static generateSecret(): string {
        return `whsec_${crypto.randomBytes(24).toString("hex")}`;
    }

    /**
     * Sign a raw JSON payload with HMAC-SHA256
     * Signature Payload = `${timestamp}.${rawBody}`
     * Output Header = `t=${timestamp},v1=${signature}`
     */
    public static sign(rawPayload: string, secret: string, timestamp: number = Date.now()): string {
        const signaturePayload = `${timestamp}.${rawPayload}`;
        const signature = crypto
            .createHmac("sha256", secret)
            .update(signaturePayload, "utf8")
            .digest("hex");

        return `t=${timestamp},${this.SIGNATURE_VERSION}=${signature}`;
    }

    /**
     * Verify an incoming signature header against the raw body
     * Prevents timing attacks via timingSafeEqual and replay attacks via timestamp tolerance
     */
    public static verify(
        rawPayload: string,
        signatureHeader: string,
        secret: string,
        toleranceSeconds: number = 300 // 5 minutes tolerance
    ): { valid: boolean; reason?: string } {
        if (!signatureHeader || typeof signatureHeader !== "string") {
            return { valid: false, reason: "Missing or invalid signature header" };
        }

        // Parse t=... and v1=...
        const elements = signatureHeader.split(",");
        let timestamp: number | null = null;
        let providedSignature: string | null = null;

        for (const element of elements) {
            const [key, value] = element.trim().split("=");
            if (key === "t" && value) {
                timestamp = parseInt(value, 10);
            } else if (key === this.SIGNATURE_VERSION && value) {
                providedSignature = value;
            }
        }

        if (!timestamp || isNaN(timestamp) || !providedSignature) {
            return { valid: false, reason: "Malformed signature header components" };
        }

        // 1. Anti-Replay Check: Reject timestamps older or newer than tolerance
        const now = Date.now();
        const diffMs = Math.abs(now - timestamp);
        if (diffMs > toleranceSeconds * 1000) {
            return { valid: false, reason: `Timestamp outside tolerance window (${Math.round(diffMs / 1000)}s drift)` };
        }

        // 2. Compute Expected Signature
        const signaturePayload = `${timestamp}.${rawPayload}`;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(signaturePayload, "utf8")
            .digest("hex");

        // 3. Constant-Time Buffer Comparison (Mitigates timing side-channel attacks)
        try {
            const expectedBuffer = Buffer.from(expectedSignature, "hex");
            const providedBuffer = Buffer.from(providedSignature, "hex");

            if (expectedBuffer.length !== providedBuffer.length) {
                return { valid: false, reason: "Signature buffer length mismatch" };
            }

            const isMatch = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
            return isMatch ? { valid: true } : { valid: false, reason: "Cryptographic signature mismatch" };
        } catch (e: any) {
            return { valid: false, reason: e.message || "Verification failed" };
        }
    }
}

