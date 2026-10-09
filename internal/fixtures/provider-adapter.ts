import type {ProviderAdapter,ProviderObservation} from '../../src/provider-adapter.js';
// Pinned transport; no worker-controlled URL, credentials or redirects. Fixture ONLY.
export class FixtureAdapter implements ProviderAdapter {
  readonly provider = "fixture";
  supports(o: Record<string, any>) {
    return (
      o.provider === this.provider &&
      o.action === "write" &&
      o.resource === "fixture-object"
    );
  }
  constructor(
    private url: string,
    private secret: string,
  ) {
    const u = new URL(url);
    if (u.hostname !== "127.0.0.1")
      throw Error("fixture adapter is local-only");
  }
  async send(o: Record<string, any>) {
    const r = await fetch(this.url + "/effects", {
      method: "POST",
      headers: {
        authorization: "Bearer " + this.secret,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tenant: o.tenant,
        operation: o.id,
        digest: o.digest,
        idempotency_key: o.idempotency_key,
        payload: o.params,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(2500),
    });
    if (!r.ok) throw Error("uncertain provider status " + r.status);
  }
  async lookup(o: Record<string, any>) {
    const q = new URLSearchParams({ tenant: o.tenant, operation: o.id });
    const r = await fetch(this.url + "/effects?" + q, {
      headers: { authorization: "Bearer " + this.secret },
      redirect: "error",
      signal: AbortSignal.timeout(2500),
    });
    if (!r.ok) throw Error("readback unavailable");
    return (await r.json()) as ProviderObservation[];
  }
}
