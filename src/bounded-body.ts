import type http from 'node:http';

export async function readBoundedChunks(
  chunks: AsyncIterable<Uint8Array | Buffer>,
  limit: number,
) {
  const parts: Buffer[] = [];
  let size = 0;
  for await (const chunk of chunks) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > limit) throw Error('body bound');
    parts.push(buf);
  }
  return Buffer.concat(parts);
}
export const readBoundedBytes = readBoundedChunks;
export function decodeBoundedUtf8(chunks: Buffer[], limit: number) {
  const bytes = Buffer.concat(chunks);
  if (bytes.length > limit) throw Error('body bound');
  return decodeUtf8(bytes);
}
export function decodeUtf8(bytes: Uint8Array) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw Error('malformed utf-8');
  }
}
export async function readJsonBody(req: http.IncomingMessage, limit: number) {
  return JSON.parse(decodeUtf8(await readBoundedChunks(req, limit)));
}
