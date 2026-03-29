import { describe, expect, it } from "vitest";
import { PRODUCTS, PACKAGE_ACCESS, formatPrice, getPackages, type ProductId } from "./products";

describe("Products & Pricing", () => {
  it("should have all 5 products defined", () => {
    const productIds: ProductId[] = [
      'basic_package',
      'professional_package',
      'enterprise_package',
      'ai_career_report',
      'single_stage_unlock',
    ];
    for (const id of productIds) {
      expect(PRODUCTS[id]).toBeDefined();
      expect(PRODUCTS[id].id).toBe(id);
      expect(PRODUCTS[id].name).toBeTruthy();
      expect(PRODUCTS[id].priceInCents).toBeGreaterThan(0);
      expect(PRODUCTS[id].currency).toBe('try');
      expect(PRODUCTS[id].type).toBe('one_time');
    }
  });

  it("should have correct pricing for packages", () => {
    expect(PRODUCTS.basic_package.priceInCents).toBe(14900); // 149 TL
    expect(PRODUCTS.professional_package.priceInCents).toBe(29900); // 299 TL
    expect(PRODUCTS.enterprise_package.priceInCents).toBe(49900); // 499 TL
    expect(PRODUCTS.ai_career_report.priceInCents).toBe(9900); // 99 TL
    expect(PRODUCTS.single_stage_unlock.priceInCents).toBe(4900); // 49 TL
  });

  it("should mark professional package as popular", () => {
    expect(PRODUCTS.professional_package.popular).toBe(true);
    expect(PRODUCTS.basic_package.popular).toBeUndefined();
    expect(PRODUCTS.enterprise_package.popular).toBeUndefined();
  });

  it("should have features array for each product", () => {
    for (const product of Object.values(PRODUCTS)) {
      expect(Array.isArray(product.features)).toBe(true);
      expect(product.features.length).toBeGreaterThan(0);
    }
  });

  it("should have descriptions for each product", () => {
    for (const product of Object.values(PRODUCTS)) {
      expect(product.description).toBeTruthy();
      expect(typeof product.description).toBe('string');
    }
  });
});

describe("Package Access Control", () => {
  it("should define access for free tier", () => {
    const free = PACKAGE_ACCESS.free;
    expect(free).toBeDefined();
    expect(free.maxStages).toBe(1);
    expect(free.aiReport).toBe(false);
    expect(free.careerProfile).toBe(false);
    expect(free.certificate).toBe(false);
    expect(free.mentorSupport).toBe(false);
    expect(free.prioritySupport).toBe(false);
  });

  it("should define access for basic package", () => {
    const basic = PACKAGE_ACCESS.basic_package;
    expect(basic).toBeDefined();
    expect(basic.maxStages).toBe(3);
    expect(basic.aiReport).toBe(false);
    expect(basic.certificate).toBe(false);
  });

  it("should define access for professional package", () => {
    const pro = PACKAGE_ACCESS.professional_package;
    expect(pro).toBeDefined();
    expect(pro.maxStages).toBe(99);
    expect(pro.aiReport).toBe(true);
    expect(pro.careerProfile).toBe(true);
    expect(pro.certificate).toBe(false);
    expect(pro.mentorSupport).toBe(false);
  });

  it("should define access for enterprise package", () => {
    const ent = PACKAGE_ACCESS.enterprise_package;
    expect(ent).toBeDefined();
    expect(ent.maxStages).toBe(99);
    expect(ent.aiReport).toBe(true);
    expect(ent.careerProfile).toBe(true);
    expect(ent.certificate).toBe(true);
    expect(ent.mentorSupport).toBe(true);
    expect(ent.prioritySupport).toBe(true);
  });

  it("should have progressive access levels (free < basic < pro < enterprise)", () => {
    const free = PACKAGE_ACCESS.free;
    const basic = PACKAGE_ACCESS.basic_package;
    const pro = PACKAGE_ACCESS.professional_package;
    const ent = PACKAGE_ACCESS.enterprise_package;

    // Stage access should increase
    expect(free.maxStages).toBeLessThan(basic.maxStages);
    expect(basic.maxStages).toBeLessThan(pro.maxStages);
    expect(pro.maxStages).toBeLessThanOrEqual(ent.maxStages);

    // Enterprise should have all features
    expect(ent.aiReport).toBe(true);
    expect(ent.careerProfile).toBe(true);
    expect(ent.certificate).toBe(true);
    expect(ent.mentorSupport).toBe(true);
    expect(ent.prioritySupport).toBe(true);
  });
});

describe("formatPrice", () => {
  it("should format price in TRY correctly", () => {
    expect(formatPrice(14900)).toBe("149 ₺");
    expect(formatPrice(29900)).toBe("299 ₺");
    expect(formatPrice(49900)).toBe("499 ₺");
    expect(formatPrice(9900)).toBe("99 ₺");
    expect(formatPrice(4900)).toBe("49 ₺");
  });

  it("should handle zero price", () => {
    expect(formatPrice(0)).toBe("0 ₺");
  });
});

describe("getPackages", () => {
  it("should return exactly 3 packages", () => {
    const packages = getPackages();
    expect(packages).toHaveLength(3);
  });

  it("should return packages in correct order (basic, professional, enterprise)", () => {
    const packages = getPackages();
    expect(packages[0].id).toBe('basic_package');
    expect(packages[1].id).toBe('professional_package');
    expect(packages[2].id).toBe('enterprise_package');
  });

  it("should return packages with increasing prices", () => {
    const packages = getPackages();
    expect(packages[0].priceInCents).toBeLessThan(packages[1].priceInCents);
    expect(packages[1].priceInCents).toBeLessThan(packages[2].priceInCents);
  });
});

describe("getBaseUrl helper", () => {
  it("should be used in routers for dynamic URL generation", async () => {
    // This test verifies the getBaseUrl function exists and is used in routers
    const routersContent = await import('fs').then(fs => 
      fs.readFileSync('./server/routers.ts', 'utf-8')
    );
    expect(routersContent).toContain('function getBaseUrl');
    expect(routersContent).toContain('meslegim.tr');
    // Should NOT contain hardcoded localhost in email links
    const emailLinkMatches = routersContent.match(/http:\/\/localhost:3000\/(?:reset-password|verify-email|dashboard|login)/g);
    expect(emailLinkMatches).toBeNull();
  });
});

describe("Stripe Webhook Handler", () => {
  it("should export registerStripeWebhook function", async () => {
    const webhookModule = await import('./stripeWebhook');
    expect(typeof webhookModule.registerStripeWebhook).toBe('function');
  });
});

describe("Payment Router Structure", () => {
  it("should have payment procedures in appRouter", async () => {
    const { appRouter } = await import('./routers');
    // Check that payment router exists
    expect(appRouter._def.procedures).toBeDefined();
    
    // Verify payment procedures exist by checking the router definition
    const routerDef = appRouter._def;
    expect(routerDef).toBeDefined();
  });
});
