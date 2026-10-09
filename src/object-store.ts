import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
export const bytesHash = (b: Uint8Array) =>
  createHash('sha256').update(b).digest('hex');
export interface ImmutableObjectStore {
  putIfAbsent(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array>;
  erase(key: string): Promise<void>;
}
export function safeObjectKey(key: string) {
  if (
    typeof key !== 'string' ||
    key.length > 512 ||
    key
      .split('/')
      .some(
        (s) => !s || s === '.' || s === '..' || !/^[A-Za-z0-9._:-]+$/.test(s),
      )
  )
    throw Error('object key');
  return key;
}
export class LocalObjectStore implements ImmutableObjectStore {
  constructor(private root: string) {}
  async initialize() {
    await fs.mkdir(this.root, { recursive: true, mode: 0o700 });
    const s = await fs.lstat(this.root);
    if (
      !s.isDirectory() ||
      s.isSymbolicLink() ||
      (s.mode & 0o077) !== 0 ||
      s.uid !== process.getuid?.()
    )
      throw Error('private trusted object root required');
  }
  private filename(key: string) {
    return path.join(this.root, safeObjectKey(key));
  }
  async putIfAbsent(key: string, data: Uint8Array) {
    await this.initialize();
    const final = this.filename(key);
    await fs.mkdir(path.dirname(final), { recursive: true, mode: 0o700 });
    const tmp = path.join(this.root, randomUUID() + '.tmp'),
      f = await fs.open(tmp, 'wx', 0o600);
    try {
      await f.writeFile(data);
      await f.sync();
    } finally {
      await f.close();
    }
    try {
      await fs.link(tmp, final);
    } catch (e: any) {
      if (e.code !== 'EEXIST') throw e;
      if (bytesHash(await this.get(key)) !== bytesHash(data))
        throw Error('immutable object conflict');
    } finally {
      await fs.unlink(tmp);
    }
    const dir = await fs.open(path.dirname(final), 'r');
    try {
      await dir.sync();
    } finally {
      await dir.close();
    }
  }
  async get(key: string) {
    await this.initialize();
    const f = await fs.open(
      this.filename(key),
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    try {
      const stat = await f.stat();
      if (stat.size > 16777216) throw Error('object size limit');
      return new Uint8Array(await f.readFile());
    } finally {
      await f.close();
    }
  }
  async erase(key: string) {
    await this.initialize();
    try {
      await fs.unlink(this.filename(key));
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
}
