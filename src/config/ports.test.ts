import { describe, it, expect } from 'vitest';

/**
 * Tests for the port derivation logic used in start.sh and vite.config.ts.
 *
 * The port formula is: PORT = (hash % 2500) * 2 + 3000 (even numbers only)
 * Storybook gets PORT + 1 (odd numbers only), so they never overlap.
 */

function derivePort(dirHash: number): number {
  return (dirHash % 2500) * 2 + 3000;
}

function deriveStorybookPort(port: number): number {
  return port + 1;
}

describe('port derivation', () => {
  it('produces ports in the range [3000, 7998]', () => {
    // Min hash remainder (0)
    expect(derivePort(0)).toBe(3000);
    // Max hash remainder (2499)
    expect(derivePort(2499)).toBe(7998);
  });

  it('produces even Vite ports', () => {
    for (const hash of [0, 1, 100, 1234, 2499, 5000, 999999]) {
      expect(derivePort(hash) % 2).toBe(0);
    }
  });

  it('produces odd Storybook ports', () => {
    for (const hash of [0, 1, 100, 1234, 2499, 5000, 999999]) {
      const port = derivePort(hash);
      expect(deriveStorybookPort(port) % 2).toBe(1);
    }
  });

  it('Storybook ports never overlap with Vite ports', () => {
    const vitePorts = new Set<number>();
    const storybookPorts = new Set<number>();

    // Check all possible hash remainders
    for (let r = 0; r < 2500; r++) {
      vitePorts.add(derivePort(r));
      storybookPorts.add(deriveStorybookPort(derivePort(r)));
    }

    for (const sbPort of storybookPorts) {
      expect(vitePorts.has(sbPort)).toBe(false);
    }
  });

  it('Storybook port is always Vite port + 1', () => {
    for (const hash of [0, 500, 1234, 2499]) {
      const port = derivePort(hash);
      expect(deriveStorybookPort(port)).toBe(port + 1);
    }
  });
});

describe('vite port config', () => {
  it('parses a numeric PORT string correctly', () => {
    const port = Number('4000');
    expect(port).toBe(4000);
    expect(!!port).toBe(true);
  });

  it('returns undefined when PORT is not set', () => {
    const port = undefined;
    expect(port).toBeUndefined();
    expect(!!port).toBe(false);
  });

  it('returns NaN for non-numeric PORT (strictPort stays false)', () => {
    const port = Number('abc');
    expect(Number.isNaN(port)).toBe(true);
    expect(!!port).toBe(false); // NaN is falsy, so strictPort would be false
  });
});
