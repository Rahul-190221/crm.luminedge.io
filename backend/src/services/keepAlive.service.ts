// Render's free plan spins the service down after ~15 minutes without inbound
// HTTP traffic, which kills open sockets and DB connections and forces a slow
// cold start on the next request. Pinging our own health check keeps traffic
// flowing so the instance never goes idle.
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes, safely under the 15-minute spin-down window

export function initKeepAlive(): void {
  const selfUrl = process.env.RENDER_EXTERNAL_URL;
  if (process.env.NODE_ENV !== 'production' || !selfUrl) return;

  setInterval(async () => {
    try {
      const res = await fetch(`${selfUrl}/api/health`);
      console.log(`[KeepAlive] Self-ping responded with status ${res.status}`);
    } catch (err) {
      console.error('[KeepAlive] Self-ping failed:', err);
    }
  }, PING_INTERVAL_MS);

  console.log(`[KeepAlive] Self-ping scheduled every ${PING_INTERVAL_MS / 60000} minutes to ${selfUrl}/api/health`);
}
