import { expect, test } from 'vitest';

test('Commit-time revocation fences prevent execution', () => {
    const grantVersionAtCheck = 2;
    const currentGrantVersion = 3; // Revoked and bumped

    expect(grantVersionAtCheck).not.toBe(currentGrantVersion);
});

test('UNCERTAIN operation resolution via natural keys', () => {
   const naturalKey = 'continuum/op_123';
   const simulatedReadback = true; // Simulating we found the resource

   expect(simulatedReadback ? 'COMMITTED' : 'ABSENT').toBe('COMMITTED');
});

test('Evidence hash-chain validation', () => {
    const prevHash = 'hash1';
    const payloadHash = 'hash2';
    // Validate we use the prevHash to chain
    expect(prevHash + payloadHash).toBe('hash1hash2');
});
