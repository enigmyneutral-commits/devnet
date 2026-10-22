import { randomBytes } from "node:crypto";
import { signPayload, verifyPayload } from "./identity.js";

const MESSAGE_TYPES = new Set([
  "node.hello",
  "node.heartbeat",
  "service.announce",
  "service.resolve",
  "service.resolve.result",
  "route.health",
  "route.failover",
  "error",
]);

export function createEnvelope({ type, payload, identity, now = Date.now(), nonce = randomBytes(16).toString("base64url") }) {
  if (!MESSAGE_TYPES.has(type)) throw new TypeError("Unsupported DEVNET message type");
  if (!identity?.nodeId || !identity?.privateKeyPem || !identity?.publicKeyPem) {
    throw new TypeError("Complete node identity is required");
  }
  if (!Number.isFinite(now)) throw new TypeError("Message timestamp must be numeric");
  if (typeof nonce !== "string" || !/^[A-Za-z0-9_-]{16,64}$/.test(nonce)) throw new TypeError("Invalid message nonce");
  const body = { protocol: "devnet", version: 1, type, senderNodeId: identity.nodeId, timestamp: now, nonce, payload };
  return Object.freeze({
    body,
    publicKeyPem: identity.publicKeyPem,
    signature: signPayload(body, identity.privateKeyPem),
  });
}

/**
 * Verify signature, sender identity, allowed type, freshness and replay.
 * Use a shared ReplayGuard per authenticated connection/peer in the real transport.
 */
export function verifyEnvelope(envelope, { now = Date.now(), maxAgeMs = 30_000, replayGuard = null, allowedNodeIds = null } = {}) {
  const body = envelope?.body;
  if (!body || body.protocol !== "devnet" || body.version !== 1) return { valid: false, reason: "unsupported_protocol" };
  if (!MESSAGE_TYPES.has(body.type)) return { valid: false, reason: "unsupported_message_type" };
  if (!Number.isFinite(body.timestamp) || Math.abs(now - body.timestamp) > maxAgeMs) return { valid: false, reason: "stale_message" };
  if (typeof body.nonce !== "string" || !/^[A-Za-z0-9_-]{16,64}$/.test(body.nonce)) return { valid: false, reason: "invalid_nonce" };
  if (allowedNodeIds && !new Set(allowedNodeIds).has(body.senderNodeId)) return { valid: false, reason: "sender_not_allowed" };

  const verified = verifyPayload({
    payload: body,
    signature: envelope.signature,
    publicKeyPem: envelope.publicKeyPem,
    expectedNodeId: body.senderNodeId,
  });
  if (!verified.valid) return verified;
  if (replayGuard && !replayGuard.accept(body.senderNodeId, body.nonce, body.timestamp, now)) {
    return { valid: false, reason: "replay_detected" };
  }
  return { valid: true, senderNodeId: verified.nodeId, type: body.type, payload: structuredClone(body.payload) };
}

export class ReplayGuard {
  constructor({ ttlMs = 60_000, maxEntries = 50_000 } = {}) {
    if (ttlMs < 1_000 || !Number.isInteger(maxEntries) || maxEntries < 1) throw new RangeError("Invalid replay guard limits");
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.seen = new Map();
  }

  accept(nodeId, nonce, timestamp, now = Date.now()) {
    for (const [key, expiry] of this.seen) if (expiry <= now) this.seen.delete(key);
    const key = `${nodeId}:${nonce}`;
    if (this.seen.has(key)) return false;
    if (this.seen.size >= this.maxEntries) {
      const oldestKey = this.seen.keys().next().value;
      if (oldestKey !== undefined) this.seen.delete(oldestKey);
    }
    this.seen.set(key, Math.min(timestamp + this.ttlMs, now + this.ttlMs));
    return true;
  }
}
