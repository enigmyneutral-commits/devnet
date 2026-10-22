import { parseDevnetAddress, isValidNodeId } from "./address.js";

const STATES = new Set(["online", "degraded", "offline", "unknown"]);

/** In-memory MVP registry. Production requires durable storage and signed registrations. */
export class NodeRegistry {
  #nodes = new Map();
  #services = new Map();

  registerNode({ id, ownerId, endpoint, metadata = {} }) {
    if (!isValidNodeId(id)) throw new TypeError("Invalid node id");
    if (typeof ownerId !== "string" || ownerId.trim() === "") throw new TypeError("ownerId is required");
    if (typeof endpoint !== "string") throw new TypeError("endpoint is required");
    let parsed;
    try { parsed = new URL(endpoint); } catch { throw new TypeError("Invalid endpoint URL"); }
    if (parsed.protocol !== "https:") throw new TypeError("Node endpoints must use HTTPS");
    if (parsed.username || parsed.password) throw new TypeError("Endpoint credentials are forbidden");

    const previous = this.#nodes.get(id);
    const now = new Date().toISOString();
    this.#nodes.set(id, {
      id, ownerId: ownerId.trim(), endpoint: parsed.origin,
      state: previous?.state ?? "unknown",
      lastSeenAt: previous?.lastSeenAt ?? null,
      registeredAt: previous?.registeredAt ?? now,
      updatedAt: now, metadata: structuredClone(metadata),
    });
    return this.getNode(id);
  }

  getNode(id) {
    const node = this.#nodes.get(id);
    return node ? structuredClone(node) : null;
  }

  listNodes() { return [...this.#nodes.values()].map(node => structuredClone(node)); }

  setNodeState(id, state, lastSeenAt = new Date().toISOString()) {
    if (!STATES.has(state)) throw new TypeError("Unsupported node state");
    const node = this.#nodes.get(id);
    if (!node) return false;
    node.state = state;
    node.lastSeenAt = lastSeenAt;
    node.updatedAt = new Date().toISOString();
    return true;
  }

  registerService({ address, nodeId, serviceId, priority = 100, replicaGroup = null, healthPath = "/health" }) {
    const parsed = parseDevnetAddress(address);
    if (!this.#nodes.has(nodeId)) throw new Error(`Unknown node: ${nodeId}`);
    if (typeof serviceId !== "string" || !/^[a-zA-Z0-9_-]{3,80}$/.test(serviceId)) throw new TypeError("Invalid serviceId");
    if (!Number.isInteger(priority) || priority < 0 || priority > 10000) throw new TypeError("priority must be an integer between 0 and 10000");
    if (typeof healthPath !== "string" || !healthPath.startsWith("/") || healthPath.startsWith("//")) throw new TypeError("healthPath must be an absolute path");

    const key = parsed.name;
    const existing = this.#services.get(key) ?? [];
    if (existing.some(item => item.nodeId === nodeId && item.serviceId === serviceId)) throw new Error("This service is already registered on this node");
    const record = {
      name: key, address: parsed.canonical, nodeId, serviceId, priority,
      replicaGroup, healthPath, registeredAt: new Date().toISOString(),
    };
    this.#services.set(key, [...existing, record]);
    return structuredClone(record);
  }

  resolve(address) {
    const parsed = parseDevnetAddress(address);
    const records = this.#services.get(parsed.name) ?? [];
    return {
      address: parsed,
      candidates: records.map(record => ({ ...record, node: this.getNode(record.nodeId) }))
        .filter(record => record.node !== null).map(record => structuredClone(record)),
    };
  }

  listServices() { return [...this.#services.values()].flat().map(record => structuredClone(record)); }
}
