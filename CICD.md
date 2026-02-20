# CI/CD Pipeline Documentation

Meslegim.tr projesi için otomatik test ve deployment pipeline dokümantasyonu.

## Pipeline Genel Bakış

Proje 3 ana GitHub Actions workflow'u kullanır:

1. **CI (Continuous Integration)** - Her push ve PR'da çalışır
2. **CD (Continuous Deployment)** - Main branch ve tag'lerde deployment
3. **Dependency Updates** - Haftalık otomatik güncelleme

---

## 1. CI Pipeline (`ci.yml`)

### Tetikleyiciler
- `push` → main, develop branch'leri
- `pull_request` → main, develop branch'lerine açılan PR'lar

### Jobs

#### 1.1 Lint & Type Check
**Amaç:** Kod kalitesi ve tip güvenliği kontrolü

```yaml
Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Install dependencies
4. TypeScript type check (pnpm check)
5. Format check (pnpm format --check)
```

**Başarısızlık Durumu:** PR merge edilemez

#### 1.2 Unit Tests
**Amaç:** Business logic testleri

```yaml
Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Install dependencies
4. Run unit tests (pnpm test)
5. Upload coverage reports
```

**Çıktılar:**
- Coverage report (artifact)
- Test sonuçları

#### 1.3 E2E Tests
**Amaç:** Kullanıcı akışlarını test et

```yaml
Services:
- MySQL 8.0 (test database)

Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Install dependencies
4. Install Playwright browsers
5. Setup test database
6. Run E2E tests (pnpm test:e2e)
7. Upload test results & videos
```

**Environment Variables:**
- `BASE_URL`: http://localhost:3000
- `DATABASE_URL`: Test database connection
- `JWT_SECRET`: Test JWT secret
- `RESEND_API_KEY`: Email service (secret)

**Çıktılar:**
- Playwright report (artifact, 30 gün)
- Test videos (artifact, 7 gün - sadece failure)

#### 1.4 Build Verification
**Amaç:** Production build'in başarılı olduğunu doğrula

```yaml
Dependencies: lint-and-typecheck, unit-tests

Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Install dependencies
4. Build project (pnpm build)
5. Verify dist/ directory
6. Upload build artifacts
```

**Çıktılar:**
- Build output (artifact, 7 gün)

#### 1.5 Security Audit
**Amaç:** Güvenlik açıklarını tespit et

```yaml
Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Run security audit (pnpm audit)
4. Generate audit report
5. Upload audit report
```

**Çıktılar:**
- Security audit report (artifact, 30 gün)

---

## 2. CD Pipeline (`cd.yml`)

### Tetikleyiciler
- `push` → main branch (staging deployment)
- `push` → tags v* (production deployment)
- `workflow_dispatch` → Manual rollback

### Jobs

#### 2.1 Deploy to Staging
**Tetikleyici:** Push to main branch

```yaml
Environment: staging
URL: https://staging.meslegim.tr

Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Install dependencies
4. Build project (NODE_ENV=production)
5. Deploy to Manus staging
6. Run smoke tests
7. Notify deployment status
```

**Başarısızlık Durumu:** Deployment rollback otomatik

#### 2.2 Deploy to Production
**Tetikleyici:** Push tag v* (örn: v1.0.0)

```yaml
Environment: production
URL: https://meslegim.tr

Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Install dependencies
4. Run tests (pnpm test, pnpm check)
5. Build project (NODE_ENV=production)
6. Deploy to Manus production
7. Run smoke tests
8. Create GitHub Release
9. Notify deployment status
```

**Production Deployment Checklist:**
- ✅ All CI checks passing
- ✅ Tests passing
- ✅ Build successful
- ✅ Tag created (v*)

#### 2.3 Rollback Deployment
**Tetikleyici:** Manual (workflow_dispatch)

```yaml
Environment: production

Adımlar:
1. Checkout code (full history)
2. Get previous version tag
3. Checkout previous version
4. Setup pnpm & Node.js
5. Install dependencies
6. Build project
7. Deploy rollback
8. Notify rollback status
```

**Kullanım:**
```bash
# GitHub UI'dan "Actions" → "CD (Deployment)" → "Run workflow" → "rollback"
```

---

## 3. Dependency Updates (`dependency-update.yml`)

### Tetikleyiciler
- `schedule` → Her Pazartesi 09:00 UTC
- `workflow_dispatch` → Manual

### Jobs

#### 3.1 Update Dependencies
**Amaç:** Patch ve minor güncellemeleri otomatik yap

```yaml
Schedule: Every Monday 09:00 UTC

Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Check outdated dependencies
4. Update dependencies (pnpm update --latest)
5. Run tests
6. Create Pull Request
```

**PR Details:**
- Branch: `chore/dependency-updates`
- Title: "chore: Weekly dependency updates"
- Labels: dependencies, automated
- Auto-delete branch after merge

#### 3.2 Security Updates
**Amaç:** Güvenlik açıklarını otomatik düzelt

```yaml
Schedule: Every Monday 09:00 UTC

Adımlar:
1. Checkout code
2. Setup pnpm & Node.js
3. Run security audit
4. Fix vulnerabilities (pnpm audit --fix)
5. Run tests
6. Create Security PR
```

**PR Details:**
- Branch: `security/vulnerability-fixes`
- Title: "🔒 Security: Fix vulnerabilities"
- Labels: security, automated, high-priority
- Priority: High

---

## Environment Variables & Secrets

### Required Secrets (GitHub Settings)
```
GITHUB_TOKEN          # Auto-provided by GitHub
RESEND_API_KEY        # Email service API key
```

### Environment Variables (CI)
```
NODE_ENV=test
BASE_URL=http://localhost:3000
DATABASE_URL=mysql://root:test_password@127.0.0.1:3306/meslegim_test
JWT_SECRET=test_jwt_secret_key_for_ci
```

### Environment Variables (Production)
```
NODE_ENV=production
DATABASE_URL=<production-db-url>
JWT_SECRET=<production-jwt-secret>
RESEND_API_KEY=<production-resend-key>
SENTRY_DSN=<sentry-dsn>
```

---

## Deployment Workflow

### Staging Deployment
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Develop & commit
git add .
git commit -m "feat: add new feature"

# 3. Push to remote
git push origin feature/new-feature

# 4. Create PR to main
# GitHub UI: Create Pull Request

# 5. CI runs automatically
# - Lint & Type Check
# - Unit Tests
# - E2E Tests
# - Build Verification
# - Security Audit

# 6. Merge PR to main
# Staging deployment triggers automatically

# 7. Test on staging
# https://staging.meslegim.tr
```

### Production Deployment
```bash
# 1. Ensure main is stable
git checkout main
git pull origin main

# 2. Create version tag
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. Push tag
git push origin v1.0.0

# 4. CD pipeline triggers
# - Run tests
# - Build project
# - Deploy to production
# - Create GitHub Release

# 5. Verify production
# https://meslegim.tr
```

### Rollback
```bash
# GitHub UI:
# 1. Go to Actions tab
# 2. Select "CD (Deployment)" workflow
# 3. Click "Run workflow"
# 4. Select "rollback" option
# 5. Confirm

# Rollback will:
# - Checkout previous version tag
# - Build and deploy
# - Notify status
```

---

## Monitoring & Notifications

### Build Status Badge
```markdown
![CI Status](https://github.com/username/meslegim-tr/workflows/CI/badge.svg)
```

### Notification Channels
- GitHub Actions UI (default)
- Email notifications (GitHub settings)
- Slack/Discord (optional integration)

### Monitoring Checklist
- [ ] CI pipeline status
- [ ] Test coverage trends
- [ ] Build success rate
- [ ] Deployment frequency
- [ ] Security audit results

---

## Troubleshooting

### CI Pipeline Başarısız

**Problem:** Lint errors
```bash
# Local'de çalıştır
pnpm format
pnpm check
```

**Problem:** Unit tests fail
```bash
# Local'de test et
pnpm test
pnpm test --watch
```

**Problem:** E2E tests fail
```bash
# Local'de test et
pnpm test:e2e:headed
pnpm test:e2e:debug
```

**Problem:** Build fails
```bash
# Local'de build et
pnpm build
```

### Deployment Başarısız

**Problem:** Staging deployment fails
```bash
# Check logs in GitHub Actions
# Rollback to previous version
# Fix issue and redeploy
```

**Problem:** Production deployment fails
```bash
# Immediate rollback via workflow_dispatch
# Investigate logs
# Fix and create new tag
```

### Dependency Update PR Conflicts

**Problem:** Merge conflicts in package.json
```bash
# 1. Checkout branch
git checkout chore/dependency-updates

# 2. Rebase on main
git rebase main

# 3. Resolve conflicts
# Edit package.json manually

# 4. Continue rebase
git rebase --continue

# 5. Force push
git push --force-with-lease
```

---

## Best Practices

### 1. Commit Messages
```
feat: add new feature
fix: resolve bug
chore: update dependencies
docs: update documentation
test: add test cases
refactor: improve code structure
perf: optimize performance
security: fix vulnerability
```

### 2. PR Guidelines
- Keep PRs small and focused
- Write descriptive titles
- Include test cases
- Update documentation
- Wait for CI to pass

### 3. Version Tagging
```
v1.0.0 - Major release (breaking changes)
v1.1.0 - Minor release (new features)
v1.1.1 - Patch release (bug fixes)
```

### 4. Testing Strategy
- Write unit tests for business logic
- Write E2E tests for user flows
- Test locally before pushing
- Review test coverage reports

### 5. Security
- Review dependency updates
- Fix vulnerabilities immediately
- Use secrets for sensitive data
- Audit regularly

---

## Maintenance

### Weekly Tasks
- [ ] Review dependency update PRs
- [ ] Check security audit results
- [ ] Monitor test coverage
- [ ] Review failed builds

### Monthly Tasks
- [ ] Review CI/CD metrics
- [ ] Update documentation
- [ ] Optimize pipeline performance
- [ ] Clean up old artifacts

### Quarterly Tasks
- [ ] Review and update workflows
- [ ] Evaluate new tools
- [ ] Performance audit
- [ ] Security review

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm Documentation](https://pnpm.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
