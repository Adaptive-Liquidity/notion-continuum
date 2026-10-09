import { createHash } from "node:crypto";
import type {
  ProviderAdapter,
  ProviderObservation,
} from "../provider-adapter.js";
export const safeRepository = {
  owner: "Adaptive-Liquidity",
  repo: "Continuum",
  commit: "9ac4723b5390d22ed2d6aed9cf984cb0a32731ca",
};
export class GitHubReadOnlyAdapter implements ProviderAdapter {
  readonly provider = "github-public-readonly";
  readonly evidence: Array<Record<string, unknown>> = [];
  constructor(private deadlineMs = 5000) {}
  supports(o: Record<string, any>) {
    return (
      o.provider === this.provider &&
      o.action === "readCommit" &&
      o.resource ===
        `repo:${safeRepository.owner}/${safeRepository.repo}@${safeRepository.commit}` &&
      o.params &&
      Object.keys(o.params).sort().join(",") === "commit,owner,repo" &&
      o.params.owner === safeRepository.owner &&
      o.params.repo === safeRepository.repo &&
      o.params.commit === safeRepository.commit
    );
  }
  private async get(path: string) {
    const url = "https://api.github.com" + path;
    const start = Date.now();
    // Read-only immutable object; no token, user-controlled URL, redirect, mutation or transport fallback.
    const r = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": "Continuum-production-qualification-readonly",
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "cache-control": "no-cache",
      },
      redirect: "error",
      signal: AbortSignal.timeout(this.deadlineMs),
      cache: "no-store",
    });
    const text = await r.text();
    if (text.length > 262144) throw Error("oversized provider response");
    this.evidence.push({
      url,
      method: "GET",
      status: r.status,
      date: r.headers.get("date"),
      etag: r.headers.get("etag"),
      requestId: r.headers.get("x-github-request-id"),
      elapsedMs: Date.now() - start,
      responseBody: text,
      responseSha256: createHash("sha256").update(text).digest("hex"),
    });
    if (!r.ok) throw Error("provider read unavailable " + r.status);
    return JSON.parse(text);
  }
  async send(o: Record<string, any>) {
    if (!this.supports(o)) throw Error("safe read contract mismatch");
    const x = await this.get(
      `/repos/${safeRepository.owner}/${safeRepository.repo}/git/commits/${safeRepository.commit}`,
    );
    if (
      x.sha !== safeRepository.commit ||
      x.tree?.sha !== "dcd778fa3a539de0132c2a7ec32c36aaf876f94d"
    )
      throw Error("commit response mismatch");
  }
  async lookup(o: Record<string, any>): Promise<ProviderObservation[]> {
    if (!this.supports(o)) throw Error("safe read contract mismatch");
    const x = await this.get(
      `/repos/${safeRepository.owner}/${safeRepository.repo}/commits/${safeRepository.commit}`,
    );
    if (
      x.sha !== safeRepository.commit ||
      x.commit?.tree?.sha !== "dcd778fa3a539de0132c2a7ec32c36aaf876f94d"
    )
      return [];
    return [
      {
        tenant: o.tenant,
        operation: o.id,
        digest: o.digest,
        idempotency_key: o.idempotency_key,
        payload: o.params,
      },
    ];
  }
}
