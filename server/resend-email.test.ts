import { describe, it, expect } from 'vitest';
import { Resend } from 'resend';

describe('Resend Email Configuration', () => {
  it('should have valid RESEND_API_KEY', () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
  });

  it('should be able to create Resend instance', () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    expect(resend).toBeDefined();
  });

  // Note: We don't actually send emails in tests to avoid rate limits
  // Real email sending will be tested manually
});
