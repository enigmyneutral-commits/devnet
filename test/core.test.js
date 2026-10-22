import test from "node:test";
import assert from "node:assert/strict";
import { parseDevnetAddress, NodeRegistry, HealthMonitor, RouteManager } from "../src/index.js";

function setup() {
  const registry = new NodeRegistry();
  registry.registerNode({ id: "node-a", ownerId: "owner-a", endpoint: "https://node-a.example.invalid" });
  registry.registerNode({ id: "node-b", ownerId: "owner-a", endpoint: "https://node-b.example.invalid" });
  const health = new HealthMonitor(registry, { failureThreshold: 2, degradedAfterMs: 1000, offlineAfterMs: 3000 });
  health.heartbeat("node-a", 100_000);
  health.heartbeat("node-b", 103_500);
  return { registry, health };
}

test("parses canonical URI and logical hostname", () => {
  assert.equal(parseDevnetAddress("devnet://api.shop").name, "api.shop");
  assert.equal(parseDevnetAddress("api.shop.devnet").canonical, "devnet://api.shop");
  assert.equal(parseDevnetAddress("devnet://api.shop/v1").path, "/v1");
});

test("rejects credentials, ports and literal or encoded traversal", () => {
  assert.throws(() => parseDevnetAddress("devnet://user:pass@api.shop"), /Credentials/);
  assert.throws(() => parseDevnetAddress("api.shop:8080"), /hostname/);
  assert.throws(() => parseDevnetAddress("devnet://api.shop/../admin"), /traversal/);
  assert.throws(() => parseDevnetAddress("devnet://api.shop/%2e%2e/admin"), /traversal/);
});

test("requires HTTPS endpoints and registered nodes", () => {
  const registry = new NodeRegistry();
  assert.throws(() => registry.registerNode({ id: "node-a", ownerId: "o", endpoint: "http://localhost:3000" }), /HTTPS/);
  assert.throws(() => registry.registerService({ address: "devnet://api.shop", nodeId: "missing", serviceId: "api-001" }), /Unknown node/);
});

test("selects an authorized replica when the primary node goes offline", () => {
  const { registry, health } = setup();
  registry.registerService({ address: "devnet://api.shop", nodeId: "node-a", serviceId: "api-001", priority: 1, replicaGroup: "shop-api" });
  registry.registerService({ address: "devnet://api.shop", nodeId: "node-b", serviceId: "api-002", priority: 2, replicaGroup: "shop-api" });
  const routes = new RouteManager(registry);
  assert.equal(routes.plan("api.shop").primary.nodeId, "node-a");
  health.evaluate(104_000);
  const plan = routes.plan("api.shop");
  assert.equal(plan.primary.nodeId, "node-b");
  assert.equal(plan.failoverPossible, false);
});

test("does not pretend an unavailable application is recoverable without a replica", () => {
  const { registry, health } = setup();
  registry.registerService({ address: "devnet://api.only", nodeId: "node-a", serviceId: "api-003" });
  health.evaluate(104_000);
  const plan = new RouteManager(registry).plan("api.only");
  assert.equal(plan.status, "unavailable");
  assert.equal(plan.primary, null);
});

test("heartbeat restores an offline node", () => {
  const { registry, health } = setup();
  health.evaluate(104_000);
  assert.equal(registry.getNode("node-a").state, "offline");
  health.heartbeat("node-a", 104_100);
  assert.equal(registry.getNode("node-a").state, "online");
});
