import { describe, it, expect, vi } from 'vitest';

// ===== SCHOOL MANAGEMENT TESTS =====
describe('School Management', () => {
  describe('Schema', () => {
    it('should have schools table with required fields', async () => {
      const schema = await import('../drizzle/schema');
      expect(schema.schools).toBeDefined();
      // Verify the table exists
      const tableConfig = (schema.schools as any);
      expect(tableConfig).toBeTruthy();
    });

    it('should have schoolMentors junction table', async () => {
      const schema = await import('../drizzle/schema');
      expect(schema.schoolMentors).toBeDefined();
    });
  });

  describe('DB Helpers', () => {
    it('should export createSchool function', async () => {
      const db = await import('./db');
      expect(typeof db.createSchool).toBe('function');
    });

    it('should export getSchoolById function', async () => {
      const db = await import('./db');
      expect(typeof db.getSchoolById).toBe('function');
    });

    it('should export getAllSchools function', async () => {
      const db = await import('./db');
      expect(typeof db.getAllSchools).toBe('function');
    });

    it('should export updateSchool function', async () => {
      const db = await import('./db');
      expect(typeof db.updateSchool).toBe('function');
    });

    it('should export assignMentorToSchool function', async () => {
      const db = await import('./db');
      expect(typeof db.assignMentorToSchool).toBe('function');
    });

    it('should export removeMentorFromSchool function', async () => {
      const db = await import('./db');
      expect(typeof db.removeMentorFromSchool).toBe('function');
    });

    it('should export getSchoolMentors function', async () => {
      const db = await import('./db');
      expect(typeof db.getSchoolMentors).toBe('function');
    });
  });
});

// ===== PROMOTION CODE TESTS =====
describe('Promotion Code System', () => {
  describe('Schema', () => {
    it('should have promotionCodes table', async () => {
      const schema = await import('../drizzle/schema');
      expect(schema.promotionCodes).toBeDefined();
    });
  });

  describe('DB Helpers', () => {
    it('should export createPromotionCode function', async () => {
      const db = await import('./db');
      expect(typeof db.createPromotionCode).toBe('function');
    });

    it('should export validatePromotionCode function', async () => {
      const db = await import('./db');
      expect(typeof db.validatePromotionCode).toBe('function');
    });

    it('should export usePromotionCode function', async () => {
      const db = await import('./db');
      expect(typeof db.usePromotionCode).toBe('function');
    });

    it('should export getAllPromotionCodes function', async () => {
      const db = await import('./db');
      expect(typeof db.getAllPromotionCodes).toBe('function');
    });
  });

  describe('Validation Logic', () => {
    it('validatePromotionCode should return valid:false for non-existent code', async () => {
      const db = await import('./db');
      const result = await db.validatePromotionCode('NONEXISTENT_CODE_12345');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

// ===== ACTIVITY LOG TESTS =====
describe('Activity Log System', () => {
  describe('Schema', () => {
    it('should have activityLogs table', async () => {
      const schema = await import('../drizzle/schema');
      expect(schema.activityLogs).toBeDefined();
    });
  });

  describe('DB Helpers', () => {
    it('should export logActivity function', async () => {
      const db = await import('./db');
      expect(typeof db.logActivity).toBe('function');
    });

    it('should export getActivityLogs function', async () => {
      const db = await import('./db');
      expect(typeof db.getActivityLogs).toBe('function');
    });

    it('should export getActivityLogStats function', async () => {
      const db = await import('./db');
      expect(typeof db.getActivityLogStats).toBe('function');
    });
  });
});

// ===== ROLE SYSTEM TESTS =====
describe('Role System', () => {
  describe('Role Helper', () => {
    it('should export role hierarchy functions', async () => {
      const roleHelper = await import('./roleHelper');
      expect(typeof roleHelper.hasRoleLevel).toBe('function');
      expect(typeof roleHelper.isSuperAdmin).toBe('function');
      expect(typeof roleHelper.isAdminLevel).toBe('function');
      expect(typeof roleHelper.isSchoolAdminLevel).toBe('function');
    });

    it('super_admin should have highest role level', async () => {
      const { hasRoleLevel } = await import('./roleHelper');
      expect(hasRoleLevel('super_admin', 'admin')).toBe(true);
      expect(hasRoleLevel('super_admin', 'school_admin')).toBe(true);
      expect(hasRoleLevel('super_admin', 'mentor')).toBe(true);
      expect(hasRoleLevel('super_admin', 'student')).toBe(true);
    });

    it('admin should not have super_admin level', async () => {
      const { hasRoleLevel } = await import('./roleHelper');
      expect(hasRoleLevel('admin', 'super_admin')).toBe(false);
    });

    it('student should only have student level', async () => {
      const { hasRoleLevel } = await import('./roleHelper');
      expect(hasRoleLevel('student', 'student')).toBe(true);
      expect(hasRoleLevel('student', 'mentor')).toBe(false);
      expect(hasRoleLevel('student', 'admin')).toBe(false);
    });

    it('isSuperAdmin should correctly identify super_admin', async () => {
      const { isSuperAdmin } = await import('./roleHelper');
      expect(isSuperAdmin('super_admin')).toBe(true);
      expect(isSuperAdmin('admin')).toBe(false);
      expect(isSuperAdmin('student')).toBe(false);
    });

    it('isAdminLevel should include admin and super_admin', async () => {
      const { isAdminLevel } = await import('./roleHelper');
      expect(isAdminLevel('super_admin')).toBe(true);
      expect(isAdminLevel('admin')).toBe(true);
      expect(isAdminLevel('school_admin')).toBe(false);
      expect(isAdminLevel('mentor')).toBe(false);
    });

    it('isSchoolAdminLevel should include school_admin and above', async () => {
      const { isSchoolAdminLevel } = await import('./roleHelper');
      expect(isSchoolAdminLevel('super_admin')).toBe(true);
      expect(isSchoolAdminLevel('admin')).toBe(true);
      expect(isSchoolAdminLevel('school_admin')).toBe(true);
      expect(isSchoolAdminLevel('mentor')).toBe(false);
    });
  });
});

// ===== PRODUCTS TESTS =====
describe('Products Configuration', () => {
  it('should export PRODUCTS with correct structure', async () => {
    const { PRODUCTS } = await import('./products');
    expect(PRODUCTS).toBeDefined();
    expect(typeof PRODUCTS).toBe('object');
    
    // Check that each product has required fields
    for (const [key, product] of Object.entries(PRODUCTS)) {
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('priceInCents');
      expect(typeof (product as any).priceInCents).toBe('number');
      expect((product as any).priceInCents).toBeGreaterThan(0);
    }
  });

  it('should export PACKAGE_ACCESS with stage access info', async () => {
    const { PACKAGE_ACCESS } = await import('./products');
    expect(PACKAGE_ACCESS).toBeDefined();
    expect(typeof PACKAGE_ACCESS).toBe('object');
  });

  it('should have basic, professional and enterprise packages', async () => {
    const { PRODUCTS } = await import('./products');
    expect(PRODUCTS.basic_package).toBeDefined();
    expect(PRODUCTS.professional_package).toBeDefined();
    expect(PRODUCTS.enterprise_package).toBeDefined();
  });

  it('packages should have increasing prices', async () => {
    const { PRODUCTS } = await import('./products');
    expect(PRODUCTS.basic_package.priceInCents).toBeLessThan(PRODUCTS.professional_package.priceInCents);
    expect(PRODUCTS.professional_package.priceInCents).toBeLessThan(PRODUCTS.enterprise_package.priceInCents);
  });
});

// ===== STRIPE WEBHOOK TESTS =====
describe('Stripe Webhook', () => {
  it('should export registerStripeWebhook function', async () => {
    const webhook = await import('./stripeWebhook');
    expect(typeof webhook.registerStripeWebhook).toBe('function');
  });

  it('should export getStripe function', async () => {
    const webhook = await import('./stripeWebhook');
    expect(typeof webhook.getStripe).toBe('function');
  });
});

// ===== ROUTER STRUCTURE TESTS =====
describe('Router Structure', () => {
  it('should have school router in appRouter', async () => {
    const { appRouter } = await import('./routers');
    const procedures = Object.keys(appRouter._def.procedures);
    const schoolProcedures = procedures.filter(p => p.startsWith('school.'));
    expect(schoolProcedures.length).toBeGreaterThan(0);
  });

  it('should have superAdmin router in appRouter', async () => {
    const { appRouter } = await import('./routers');
    const procedures = Object.keys(appRouter._def.procedures);
    const superAdminProcedures = procedures.filter(p => p.startsWith('superAdmin.'));
    expect(superAdminProcedures.length).toBeGreaterThan(0);
  });

  it('should have promotionCode router in appRouter', async () => {
    const { appRouter } = await import('./routers');
    const procedures = Object.keys(appRouter._def.procedures);
    const promoProcedures = procedures.filter(p => p.startsWith('promotionCode.'));
    expect(promoProcedures.length).toBeGreaterThan(0);
  });

  it('should have payment router with checkout and history', async () => {
    const { appRouter } = await import('./routers');
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain('payment.createCheckoutSession');
    expect(procedures).toContain('payment.getMyPurchases');
  });

  it('should have admin purchase management endpoints', async () => {
    const { appRouter } = await import('./routers');
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain('admin.getAllPurchases');
    expect(procedures).toContain('admin.refundPurchase');
    expect(procedures).toContain('admin.getPurchaseStats');
  });
});
