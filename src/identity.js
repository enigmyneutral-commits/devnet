import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
  verify,
} from "node:crypto";

function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(key => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
}

function toBase64Url(buffer) {
  return Buffer.from(buffer).toString("base64url");
}

function fromBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new TypeError("Expected base64url data");
  }
  return Buffer.from(value, "base64url");
}

/** Generate a local Ed25519 identity. Keep privateKeyPem secret and out of source control. */
export function createNodeIdentity() {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" });
  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" });
  const publicDer = publicKey.export({ type: "spki", format: "der" });
  const fingerprint = createHash("sha256").update(publicDer).digest("hex");
  return Object.freeze({
    nodeId: `node-${fingerprint.slice(0, 32)}`,
    fingerprint,
    publicKeyPem,
    privateKeyPem,
  });
}

/** Sign a JSON-compatible payload with the supplied PEM private key. */
export function signPayload(payload, privateKeyPem) {
  if (typeof privateKeyPem !== "string") throw new TypeError("Private key PEM is required");
  const bytes = Buffer.from(canonicalize(payload), "utf8");
  const signature = sign(null, bytes, createPrivateKey(privateKeyPem));
  return toBase64Url(signature);
}

/** Verify a signed JSON-compatible payload and bind it to the expected node fingerprint. */
export function verifyPayload({ payload, signature, publicKeyPem, expectedNodeId = null }) {
  try {
    const publicKey = createPublicKey(publicKeyPem);
    const publicDer = publicKey.export({ type: "spki", format: "der" });
    const fingerprint = createHash("sha256").update(publicDer).digest("hex");
    const nodeId = `node-${fingerprint.slice(0, 32)}`;
    if (expectedNodeId && nodeId !== expectedNodeId) return { valid: false, reason: "node_id_mismatch" };
    const valid = verify(null, Buffer.from(canonicalize(payload), "utf8"), publicKey, fromBase64Url(signature));
    return { valid, reason: valid ? null : "invalid_signature", nodeId, fingerprint };
  } catch {
    return { valid: false, reason: "invalid_signed_payload" };
  }
}

/** Create a signed service record. Callers must validate ownership and authorization separately. */
export function createSignedServiceRecord(record, identity, { now = Date.now(), ttlMs = 5 * 60_000 } = {}) {
  if (!Number.isInteger(ttlMs) || ttlMs < 1_000 || ttlMs > 24 * 60 * 60_000) {
    throw new RangeError("ttlMs must be between 1 second and 24 hours");
  }
  if (!identity?.nodeId || !identity?.privateKeyPem || !identity?.publicKeyPem) {
    throw new TypeError("Complete node identity is required");
  }
  const payload = {
    version: 1,
    issuerNodeId: identity.nodeId,
    record,
    issuedAt: now,
    expiresAt: now + ttlMs,
  };
  return Object.freeze({
    payload,
    publicKeyPem: identity.publicKeyPem,
    signature: signPayload(payload, identity.privateKeyPem),
  });
}

export function verifySignedServiceRecord(signedRecord, { now = Date.now(), expectedNodeId = null } = {}) {
  if (!signedRecord?.payload || !Number.isFinite(signedRecord.payload.issuedAt) ||
      !Number.isFinite(signedRecord.payload.expiresAt)) {
    return { valid: false, reason: "invalid_record" };
  }
  if (signedRecord.payload.version !== 1) return { valid: false, reason: "unsupported_version" };
  if (signedRecord.payload.expiresAt <= now || signedRecord.payload.issuedAt > now + 30_000) {
    return { valid: false, reason: "expired_or_future_record" };
  }
  const verified = verifyPayload({
    payload: signedRecord.payload,
    signature: signedRecord.signature,
    publicKeyPem: signedRecord.publicKeyPem,
    expectedNodeId: expectedNodeId ?? signedRecord.payload.issuerNodeId,
  });
  return verified.valid
    ? { valid: true, issuerNodeId: verified.nodeId, record: structuredClone(signedRecord.payload.record), expiresAt: signedRecord.payload.expiresAt }
    : verified;
}
