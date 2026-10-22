const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Parse DEVNET names; this does not perform DNS lookups or network requests. */
export function parseDevnetAddress(input) {
  if (typeof input !== "string" || input.trim() === "") throw new TypeError("Address must be a non-empty string");
  const value = input.trim();
  let hostname;
  let pathname = "/";

  if (value.startsWith("devnet://")) {
    let parsed;
    try { parsed = new URL(value); } catch { throw new TypeError("Invalid DEVNET URI"); }
    if (parsed.protocol !== "devnet:") throw new TypeError("Unsupported protocol");
    if (parsed.username || parsed.password || parsed.port || parsed.search || parsed.hash) {
      throw new TypeError("Credentials, ports, query strings and fragments are not allowed in DEVNET authority");
    }
    hostname = parsed.hostname.toLowerCase();
    pathname = parsed.pathname || "/";
  } else {
    hostname = value.toLowerCase().replace(/\.$/, "");
    if (hostname.includes("/") || hostname.includes("@") || hostname.includes(":")) {
      throw new TypeError("Expected a DEVNET logical hostname");
    }
    if (hostname.endsWith(".devnet")) hostname = hostname.slice(0, -".devnet".length);
  }

  const labels = hostname.split(".");
  if (labels.length < 1 || labels.length > 8 || labels.some(label => !LABEL.test(label))) {
    throw new TypeError("Invalid DEVNET name: use lowercase letters, digits and internal hyphens");
  }
  if (pathname.split("/").some(part => part === "." || part === "..")) throw new TypeError("Path traversal segments are not allowed");

  return Object.freeze({
    scheme: "devnet",
    name: labels.join("."),
    labels: Object.freeze(labels),
    service: labels[0],
    project: labels.slice(1).join(".") || labels[0],
    path: pathname,
    canonical: `devnet://${labels.join(".")}${pathname === "/" ? "" : pathname}`,
  });
}

export function isValidNodeId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,63}$/.test(value);
}
