import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins truthy string args', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('supports conditional expressions', () => {
    const active = true;
    const disabled = false;
    expect(cn('base', active && 'active', disabled && 'disabled')).toBe('base active');
  });

  it('flattens arrays', () => {
    expect(cn('a', ['b', null, ['c']])).toBe('a b c');
  });

  it('applies object keys whose values are truthy', () => {
    expect(cn({ a: true, b: false, c: 1 as unknown as boolean })).toBe('a c');
  });
});
