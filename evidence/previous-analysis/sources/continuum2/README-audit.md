# Phase 0 Audit Notes

## Adaptive-Liquidity/floks-pc
- Validated: NextJS/TypeScript monolith with schemas, migrations, runloop adapters.
- 0001_node_computers.sql found containing: `node_computers`, `computer_pair_codes`, `computer_capabilities`, `computer_jobs`, `computer_checkpoints`, `computer_handoffs`, `computer_audit_events`.
- MCP / runloop ComputerService integrations exist in `src/lib/computers`. This contains the foundation of the Staxion runloop compute layer integration.

## Adaptive-Liquidity/genesis-runtime
- Validated: Rust implementation of VERA.
- Found principal identity rotation and authority attenuation semantics in `crates/aeon_agent_runtime/src/identity.rs`, utilizing Ed25519 signatures, verifying keys, and canonical payload digestion logic.

## Adaptive-Liquidity/Continuum
- Validated: Found hash-chain evidence linking logic and test scenarios in `proofs/continuum-persistence-slice/proof.py` containing `durable_state`, `grants`, `effects`, and `evidence` events (`process.phase1.started`, `grant.issued`, `effect.committed`, etc.).

## adaptiveliquidity/Nexus
- Validated: WASM snapshot/rollback sandbox. `src/security/capability.rs` defines granular `Capability` enums (`ReadFile`, `HttpGet`, `ExecuteBinary`).

## adaptiveliquidity/AEON-IQ
- Validated: Memory proxy (Postgres + pgvector). `src/memory/store.rs` defines memory row insertion interfaces, proving it operates entirely as an external memory system via PostgreSQL.
