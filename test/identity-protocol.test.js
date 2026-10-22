import test from "node:test";
import assert from "node:assert/strict";
import {
  createNodeIdentity, signPayload, verifyPayload,
  createSignedServiceRecord, verifySignedServiceRecord,
} from "../src/identity.js";
import { createEnvelope, verifyEnvelope, ReplayGuard } from "../src/protocol.js";

test("creates stable node identity fingerprint and verifies signed payload", () => {
  const identity = createNodeIdentity();
  assert.match(identity.nodeId, /^node-[a-f0-9]{32}$/);
  const payload = { b: 2, a: 1 };
  const signature = signPayload(payload, identity.privateKeyPem);
  assert.equal(verifyPayload({ payload: { a: 1, b: 2 }, signature, publicKeyPem: identity.publicKeyPem, expectedNodeId: identity.nodeId }).valid, true);
  assert.equal(verifyPayload({ payload: { a: 3, b: 2 }, signature, publicKeyPem: identity.publicKeyPem }).valid, false);
});

test("signs service records and rejects expired or altered records", () => {
  const identity = createNodeIdentity();
  const record = createSignedServiceRecord({ name: "api.demo", endpoint: "https://example.invalid" }, identity, { now: 10_000, ttlMs: 5_000 });
  assert.equal(verifySignedServiceRecord(record, { now: 12_000 }).valid, true);
  assert.equal(verifySignedServiceRecord(record, { now: 16_000 }).reason, "expired_or_future_record");
  const altered = { ...record, payload: { ...record.payload, record: { name: "api.evil" } } };
  assert.equal(verifySignedServiceRecord(altered, { now: 12_000 }).valid, false);
});

test("signed protocol envelopes reject tampering, stale messages and unauthorized senders", () => {
  const identity = createNodeIdentity();
  const envelope = createEnvelope({ type: "node.hello", payload: { capabilities: ["resolve"] }, identity, now: 50_000 });
  assert.equal(verifyEnvelope(envelope, { now: 50_001 }).valid, true);
  assert.equal(verifyEnvelope(envelope, { now: 90_000 }).reason, "stale_message");
  assert.equal(verifyEnvelope(envelope, { now: 50_001, allowedNodeIds: ["node-not-allowed"] }).reason, "sender_not_allowed");
  const tampered = { ...envelope, body: { ...envelope.body, payload: { capabilities: ["admin"] } } };
  assert.equal(verifyEnvelope(tampered, { now: 50_001 }).valid, false);
});

test("replay guard rejects repeated nonce for a peer", () => {
  const identity = createNodeIdentity();
  const envelope = createEnvelope({ type: "node.heartbeat", payload: { sequence: 1 }, identity, now: 100_000, nonce: "abcdefghijklmnop" });
  const guard = new ReplayGuard();
  assert.equal(verifyEnvelope(envelope, { now: 100_001, replayGuard: guard }).valid, true);
  assert.equal(verifyEnvelope(envelope, { now: 100_001, replayGuard: guard }).reason, "replay_detected");
});
