// Stub — jsonp-node.js is Node.js-only (uses fs + vm).
// In browser builds, jsonp-client uses its browser path (getJsonpBrowser) instead.
// This stub prevents Rolldown from bundling the Node-only code path.
export default function () {
  throw new Error('[jsonp-client] jsonp-node is not available in browser builds')
}
