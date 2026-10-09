# Local source/Git handoff fallback

If hosted publication is blocked, the delivered Git bundle preserves local feature history. Use your approved Git authentication, not a token in chat/Git URLs.

```bash
git clone --branch build/canonical-continuum /path/to/CONTINUUM-CANONICAL-LOCAL.bundle notion-continuum
cd notion-continuum
git remote rename origin bundle-source
git remote add origin https://github.com/Adaptive-Liquidity/notion-continuum.git
# Review source/evidence and run documented local verification first.
git push --set-upstream origin build/canonical-continuum
# Open only a DRAFT PR to main; do not merge/deploy.
```

An existing checkout/branch must not be force-reset or force-pushed. Prefer a fresh folder or a separately named worktree. Final commit/ZIP/bundle hashes are in the delivered external metadata; the canonical code is not a collection of handoff ZIPs in Git.
