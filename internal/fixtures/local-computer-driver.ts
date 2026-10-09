import { assertLocalFixtures } from '../../src/runtime-profile.js';
// Test-only process/UID/network namespace driver, not a managed VM or production host.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type {
  ComputerDriver,
  Placement,
  PlacementSpec,
} from '../../src/computers.js';
export class LocalComputerDriver implements ComputerDriver {
  private placements = new Map<
    string,
    Placement & {
      child: ChildProcess;
      pid: number;
      directory: string;
      uid: number;
    }
  >();
  private counter = 0;
  constructor(private root: string) {
    assertLocalFixtures('local computer fixture');
  }
  async start(s: PlacementSpec) {
    const id = 'local-' + randomUUID(),
      directory = path.join(this.root, id),
      uid = 110000 + ++this.counter;
    await fs.mkdir(directory, { recursive: true, mode: 0o700 });
    const own = spawnSync('sudo', ['-n', 'chown', `${uid}:${uid}`, directory]);
    if (own.status !== 0) throw Error('fixture chown failed');
    const child = spawn(
      'sudo',
      [
        '-n',
        'unshare',
        '--net',
        '--',
        'setpriv',
        `--reuid=${uid}`,
        `--regid=${uid}`,
        '--clear-groups',
        '--no-new-privs',
        '--bounding-set=-all',
        '--inh-caps=-all',
        '--ambient-caps=-all',
        process.execPath,
        '-e',
        "console.log('READY '+process.pid);setInterval(()=>{},1000)",
      ],
      { cwd: directory, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const pid = await new Promise<number>((r, j) => {
      let err = '';
      const timer = setTimeout(() => j(Error('fixture startup timeout')), 5000);
      child.stderr!.on('data', (b) => (err += b));
      child.stdout!.once('data', (b) => {
        clearTimeout(timer);
        const pid = Number(String(b).trim().split(' ')[1]);
        Number.isInteger(pid) ? r(pid) : j(Error('fixture PID'));
      });
      child.once('error', j);
      child.once('exit', (code) => {
        clearTimeout(timer);
        if (code !== 0) j(Error('fixture startup failed ' + err));
      });
    });
    const view = {
      id,
      tenant: s.tenant,
      computer: s.computer,
      generation: s.generation,
      status: 'RUNNING' as const,
      child,
      pid,
      directory,
      uid,
    };
    this.placements.set(id, view);
    return this.public(view);
  }
  private public(v: Placement) {
    return {
      id: v.id,
      tenant: v.tenant,
      computer: v.computer,
      generation: v.generation,
      status: v.status,
    };
  }
  async inspect(id: string) {
    const v = this.placements.get(id);
    if (!v) throw Error('placement missing');
    return this.public({
      ...v,
      status: v.child.exitCode === null ? 'RUNNING' : 'STOPPED',
    } as Placement);
  }
  details(id: string) {
    const v = this.placements.get(id);
    if (!v) throw Error('placement missing');
    return v;
  }
  async stop(id: string) {
    const v = this.details(id);
    if (v.child.exitCode === null && v.child.signalCode === null) {
      const exit = new Promise<void>((r) => v.child.once('exit', () => r()));
      const kill = spawnSync('sudo', ['-n', 'kill', '-KILL', String(v.pid)]);
      if (kill.status !== 0) throw Error('fixture stop failed');
      await exit;
    }
    await fs.rm(v.directory, { recursive: true, force: true });
    v.status = 'STOPPED';
  }
  async close() {
    for (const id of this.placements.keys()) await this.stop(id);
  }
}
