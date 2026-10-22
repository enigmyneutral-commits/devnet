/** Selects among owner-registered service replicas; never acts as an open proxy. */
export class RouteManager {
  constructor(registry, { maxCandidates = 8 } = {}) {
    if (!registry) throw new TypeError("registry is required");
    this.registry = registry;
    this.maxCandidates = maxCandidates;
  }

  plan(address, { allowedNodeIds = null, excludeNodeIds = [], requireReplicaGroup = false } = {}) {
    const result = this.registry.resolve(address);
    const excluded = new Set(excludeNodeIds);
    const allowed = allowedNodeIds ? new Set(allowedNodeIds) : null;
    let candidates = result.candidates.filter(candidate => {
      if (candidate.node.state !== "online" || excluded.has(candidate.nodeId)) return false;
      if (allowed && !allowed.has(candidate.nodeId)) return false;
      if (requireReplicaGroup && !candidate.replicaGroup) return false;
      return true;
    });
    candidates.sort((a, b) => a.priority - b.priority || a.nodeId.localeCompare(b.nodeId));
    const selected = candidates.slice(0, this.maxCandidates);
    return {
      address: result.address.canonical,
      status: selected.length ? "available" : (result.candidates.length ? "unavailable" : "not_found"),
      primary: selected[0] ?? null,
      alternatives: selected.slice(1),
      failoverPossible: selected.length > 1,
      note: selected.length === 0
        ? "No healthy, authorized endpoint is available. A relay alone cannot replace an offline application."
        : "Only owner-registered endpoints are eligible for routing.",
    };
  }
}
