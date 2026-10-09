# Owner actions — Caelin

Offline engineering does not wait for these. They unlock live staging tests, not production approval. Never paste secrets into chat, Notion, reports or Git.

- [ ] Set up **WorkOS/AuthKit staging sign-in**, MFA, the staging domain and exact sign-in redirect URLs.
- [ ] Connect **renewable, short-lived machine identity** and approve which tenant/person each staging worker may act for.
- [ ] Inject staging secrets, TLS/signing keys and separate service credentials through the approved **secret manager or secure connections**—share references, not secret values.
- [ ] Authorize disposable **managed computers, private networking, HA PostgreSQL and backup/WAL storage**. Grant limited test/failover/restore permissions; set spending limits, maximum acceptable data loss and recovery time.
- [ ] Approve **one safe credentialled provider test with reliable result confirmation**, and a persistent staging host/budget for the real 24-hour scheduler comparison.
- [ ] Arrange **independent security review**. Only after all required live gates pass, approve M6 shadow and, separately, M7 single-principal canary. Until then: NO-GO.
