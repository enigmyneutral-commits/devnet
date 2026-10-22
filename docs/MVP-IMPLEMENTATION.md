# DEVNET Core MVP

## Goal

Implement the first testable protocol core: internal address parsing, node/service registration, health state and failover planning between owner-registered replicas.

## Architecture boundary

DEVNET is an addressing and communication overlay for development. It does not host or copy a developer's application. The developer owns the origin, application, database, credentials and replica policy. Cloudflare Tunnel can connect a local origin using outbound-only connections without opening inbound ports. See the [official Tunnel documentation](https://developers.cloudflare.com/tunnel/).

## Current implementation

- Address parser for `devnet://service.project` and logical `service.project.devnet` names.
- In-memory registry for nodes and owner-registered service endpoints.
- Health monitor for heartbeats, consecutive failures and stale-node evaluation.
- Route manager that selects healthy registered endpoints by priority.
- Built-in Node.js test suite for parsing, validation, health and failover.

## Critical semantics

1. A healthy alternate route can repair a failed network path only if it reaches the same live service.
2. If an origin node is offline, a relay cannot magically serve the application. The owner must register a compatible replica and manage data consistency.
3. Failover candidates are limited to explicitly registered endpoints. The MVP does not forward to arbitrary URLs, scan networks, or operate as an open proxy.
4. Node registration and heartbeat methods are library APIs only. They are not an authenticated public API yet.
5. The registry is in-memory and resets on process restart. It is not suitable for production or multi-region consensus.
6. This implementation parses DEVNET names inside application code. It does not alter public DNS or make an unmodified browser resolve custom names globally.

## Run tests

Requires Node.js 20 or later.

~~~bash
npm test
npm run check
~~~

## Next engineering stages

1. Signed node identity and enrollment.
2. Authenticated control-plane API and persistent registry.
3. Cloudflare Tunnel adapter and per-owner configuration validation.
4. Resolver protocol and browser/client integration.
5. Multi-node discovery, failure detection tuning and split-brain protection.
6. Replication contract, opt-in health checks and end-to-end integration tests.
7. Security review before production use.
