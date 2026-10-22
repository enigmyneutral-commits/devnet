/** Health state is driven by heartbeat reports from a node agent/control plane. */
export class HealthMonitor {
  constructor(registry, { failureThreshold = 3, degradedAfterMs = 15_000, offlineAfterMs = 45_000 } = {}) {
    if (!registry) throw new TypeError("registry is required");
    if (!Number.isInteger(failureThreshold) || failureThreshold < 1) throw new TypeError("failureThreshold must be a positive integer");
    if (degradedAfterMs < 1 || offlineAfterMs <= degradedAfterMs) throw new TypeError("Expected 0 < degradedAfterMs < offlineAfterMs");
    this.registry = registry;
    this.failureThreshold = failureThreshold;
    this.degradedAfterMs = degradedAfterMs;
    this.offlineAfterMs = offlineAfterMs;
    this.failures = new Map();
  }

  heartbeat(nodeId, timestamp = Date.now()) {
    if (!this.registry.getNode(nodeId)) throw new Error(`Unknown node: ${nodeId}`);
    this.failures.set(nodeId, 0);
    this.registry.setNodeState(nodeId, "online", new Date(timestamp).toISOString());
    return this.registry.getNode(nodeId);
  }

  recordFailure(nodeId) {
    if (!this.registry.getNode(nodeId)) throw new Error(`Unknown node: ${nodeId}`);
    const failures = (this.failures.get(nodeId) ?? 0) + 1;
    this.failures.set(nodeId, failures);
    if (failures >= this.failureThreshold) this.registry.setNodeState(nodeId, "degraded");
    return { nodeId, consecutiveFailures: failures, state: this.registry.getNode(nodeId).state };
  }

  evaluate(now = Date.now()) {
    const changes = [];
    for (const node of this.registry.listNodes()) {
      if (!node.lastSeenAt) continue;
      const age = now - Date.parse(node.lastSeenAt);
      let state = node.state;
      if (age >= this.offlineAfterMs) state = "offline";
      else if (age >= this.degradedAfterMs) state = "degraded";
      else if ((this.failures.get(node.id) ?? 0) < this.failureThreshold) state = "online";
      if (state !== node.state) {
        this.registry.setNodeState(node.id, state, node.lastSeenAt);
        changes.push({ nodeId: node.id, previous: node.state, current: state });
      }
    }
    return changes;
  }
}
