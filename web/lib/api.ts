import {
  EnvelopeSchema,
  CommandReceiptSchema,
  type ReadEnvelope,
  type HumanCommand,
} from '@continuum/contracts';
export type ClientEnvelope = ReadEnvelope & { csrf: string };
export async function read(
  section: string,
  query: Record<string, string> = {},
): Promise<ClientEnvelope> {
  const r = await fetch(
    '/api/continuum/v1/' + section + '?' + new URLSearchParams(query),
    { cache: 'no-store' },
  );
  if (r.status === 401) throw Error('SESSION_EXPIRED');
  if (!r.ok)
    throw Error(r.status === 409 ? 'STALE_SNAPSHOT' : 'READ_UNAVAILABLE');
  const body = await r.json();
  const { csrf, ...raw } = body;
  if (typeof csrf !== 'string') throw Error('UNKNOWN_SCHEMA');
  try {
    return { ...EnvelopeSchema.parse(raw), csrf };
  } catch {
    throw Error('UNKNOWN_SCHEMA');
  }
}
export async function command(value: HumanCommand, csrf: string) {
  const receipt = (body: unknown) => {
    const data = CommandReceiptSchema.parse(body);
    if (
      data.idempotency_key !== value.idempotency_key ||
      data.result_ref !== data.command_id ||
      data.status === 'PENDING'
    )
      throw Error('REQUEST_UNCONFIRMED');
    return data;
  };
  try {
    const r = await fetch('/api/continuum/v1/command', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-ct-csrf': csrf },
      body: JSON.stringify(value),
    });
    if (r.status === 401) throw Error('SESSION_EXPIRED');
    return receipt(await r.json());
  } catch (error) {
    if (error instanceof Error && error.message === 'SESSION_EXPIRED')
      throw error;
    const lookup = await fetch(
      '/api/continuum/v1/command?' +
        new URLSearchParams({ key: value.idempotency_key }),
      { cache: 'no-store' },
    ).catch(() => null);
    if (lookup?.ok) {
      try {
        return receipt(await lookup.json());
      } catch {}
    }
    throw Error('REQUEST_UNCONFIRMED');
  }
}
