import { NodeRegistry, HealthMonitor, RouteManager } from "../src/index.js";

const registry = new NodeRegistry();
registry.registerNode({
  id: "node-dev-a",
  ownerId: "team-demo",
  endpoint: "https://node-a.example.invalid",
  metadata: { region: "south-america", role: "primary" },
});
registry.registerNode({
  id: "node-dev-b",
  ownerId: "team-demo",
  endpoint: "https://node-b.example.invalid",
  metadata: { region: "north-america", role: "replica" },
});

const health = new HealthMonitor(registry, {
  degradedAfterMs: 5_000,
  offlineAfterMs: 15_000,
});
health.heartbeat("node-dev-a", 100_000);
health.heartbeat("node-dev-b", 114_000);

registry.registerService({
  address: "devnet://api.demo-project",
  nodeId: "node-dev-a",
  serviceId: "demo-api-primary",
  priority: 10,
  replicaGroup: "demo-api-v1",
});
registry.registerService({
  address: "devnet://api.demo-project",
  nodeId: "node-dev-b",
  serviceId: "demo-api-replica",
  priority: 20,
  replicaGroup: "demo-api-v1",
});

const routes = new RouteManager(registry);
console.log("1. Primary healthy:");
console.log(JSON.stringify(routes.plan("devnet://api.demo-project"), null, 2));

console.log("\n2. Simulate primary node outage:");
health.evaluate(116_000);
console.log(JSON.stringify(routes.plan("devnet://api.demo-project"), null, 2));

console.log("\nNote: this is a local simulation. It does not create a real tunnel or send traffic.");
