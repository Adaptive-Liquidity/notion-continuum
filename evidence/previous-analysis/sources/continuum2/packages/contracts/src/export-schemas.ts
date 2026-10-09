import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import zodToJsonSchema from 'zod-to-json-schema';
import {
  Principal,
  AuthorityGrant,
  Operation,
  Receipt,
  Checkpoint,
  EvidenceEvent,
  EvidenceCheckpoint
} from './index';

const dir = join(process.cwd(), 'json-schemas');
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const schemas = {
  Principal,
  AuthorityGrant,
  Operation,
  Receipt,
  Checkpoint,
  EvidenceEvent,
  EvidenceCheckpoint
};

for (const [name, schema] of Object.entries(schemas)) {
  const jsonSchema = zodToJsonSchema(schema, name);
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(jsonSchema, null, 2));
  console.log(`Exported ${name}.json`);
}
