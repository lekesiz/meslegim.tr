# Performance Optimization Guide

Meslegim.tr projesi için performance optimization stratejileri ve best practices.

## Backend Optimization

### 1. Database Query Optimization

#### Query Caching
```typescript
import { queryCache } from './server/utils/queryOptimization';

// Cache expensive queries
const stats = await queryCache.get(
  'admin-stats',
  async () => await getAdminStats(),
  300 // 5 minutes TTL
);

// Invalidate cache when data changes
queryCache.invalidate('admin-stats');
```

#### Index Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_user_stages_user_id ON user_stages(user_id);
CREATE INDEX idx_reports_user_stage_id ON reports(user_stage_id);
```

#### Query Best Practices
- ✅ Use `select()` with specific columns instead of `select('*')`
- ✅ Add `limit()` to queries that return lists
- ✅ Use `leftJoin()` instead of multiple queries
- ✅ Avoid N+1 queries - batch load related data
- ❌ Don't query inside loops
- ❌ Don't load unnecessary columns

### 2. API Response Optimization

#### Compression
```typescript
// Already enabled in server/_core/index.ts
import compression from 'compression';
app.use(compression());
```

#### Response Caching
```typescript
// Cache control headers
res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
```

#### Pagination
```typescript
// Always paginate large datasets
const students = await db
  .select()
  .from(users)
  .where(eq(users.role, 'student'))
  .limit(20)
  .offset(page * 20);
```

### 3. Rate Limiting

Rate limiting already configured:
- **General endpoints:** 100 requests / 15 minutes
- **Auth endpoints:** 5 requests / 15 minutes

```typescript
// server/_core/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

---

## Frontend Optimization

### 1. Code Splitting

#### Route-based Splitting
```typescript
// Use React.lazy for route components
const StudentDashboard = React.lazy(() => import('./pages/dashboard/StudentDashboard'));
const MentorDashboard = React.lazy(() => import('./pages/dashboard/MentorDashboard'));

// Wrap with Suspense
<Suspense fallback={<DashboardSkeleton />}>
  <StudentDashboard />
</Suspense>
```

#### Component-based Splitting
```typescript
// Lazy load heavy components
const ChartComponent = React.lazy(() => import('./components/Chart'));
const PDFViewer = React.lazy(() => import('./components/PDFViewer'));
```

### 2. Image Optimization

#### Lazy Loading
```html
<!-- Add 'lazy' class and data-src -->
<img 
  class="lazy" 
  data-src="/images/large-image.jpg" 
  alt="Description"
/>
```

```typescript
// Initialize lazy loading
import { lazyLoadImages } from '@/utils/performance';

useEffect(() => {
  lazyLoadImages();
}, []);
```

#### Responsive Images
```html
<img 
  srcset="
    /images/small.jpg 400w,
    /images/medium.jpg 800w,
    /images/large.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
  src="/images/medium.jpg"
  alt="Description"
/>
```

#### Image Formats
- Use WebP format with JPEG fallback
- Compress images before upload
- Serve from CDN (S3)

### 3. Performance Utilities

#### Debounce (Search Input)
```typescript
import { debounce } from '@/utils/performance';

const handleSearch = debounce((query: string) => {
  // API call
  searchStudents(query);
}, 300);
```

#### Throttle (Scroll Handler)
```typescript
import { throttle } from '@/utils/performance';

const handleScroll = throttle(() => {
  // Update UI
  updateScrollPosition();
}, 100);
```

#### Client-side Caching
```typescript
import { clientCache } from '@/utils/performance';

// Cache API response
const data = clientCache.get('students-list');
if (!data) {
  const freshData = await fetchStudents();
  clientCache.set('students-list', freshData, 60); // 60 seconds
}
```

### 4. React Query Optimization

#### Stale Time & Cache Time
```typescript
const { data } = trpc.students.list.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

#### Prefetching
```typescript
const utils = trpc.useUtils();

// Prefetch on hover
const handleMouseEnter = () => {
  utils.students.details.prefetch({ id: studentId });
};
```

#### Optimistic Updates
```typescript
const mutation = trpc.students.update.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await utils.students.list.cancel();
    
    // Snapshot previous value
    const previous = utils.students.list.getData();
    
    // Optimistically update
    utils.students.list.setData(undefined, (old) => {
      return old?.map(s => s.id === newData.id ? { ...s, ...newData } : s);
    });
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.students.list.setData(undefined, context?.previous);
  },
});
```

### 5. Bundle Size Optimization

#### Analyze Bundle
```bash
# Add to package.json
"analyze": "vite build --mode analyze"

# Run analysis
pnpm analyze
```

#### Tree Shaking
```typescript
// ✅ Good: Import only what you need
import { debounce } from 'lodash-es';

// ❌ Bad: Import entire library
import _ from 'lodash';
```

#### Dynamic Imports
```typescript
// Load heavy libraries only when needed
const loadPDF = async () => {
  const { jsPDF } = await import('jspdf');
  return new jsPDF();
};
```

---

## Monitoring & Metrics

### 1. Performance Metrics

#### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

#### Custom Metrics
```typescript
import { logPerformanceMetrics } from '@/utils/performance';

// Log on page load
window.addEventListener('load', () => {
  logPerformanceMetrics();
});
```

### 2. Sentry Performance Monitoring

Already configured in `server/utils/sentry.ts`:
- Transaction tracking
- Database query monitoring
- API endpoint performance

### 3. Winston Logging

Performance logs in `logs/combined.log`:
```typescript
import { logger } from './server/utils/logger';

logger.info('Query executed', {
  query: 'getStudents',
  duration: 150,
  rows: 25,
});
```

---

## Performance Checklist

### Backend
- [x] Rate limiting enabled
- [x] Security headers (Helmet.js)
- [x] Compression enabled
- [x] Query caching utility
- [x] Error tracking (Sentry)
- [x] Structured logging (Winston)
- [ ] Database indexes optimized
- [ ] Redis caching (optional)
- [ ] CDN for static assets

### Frontend
- [x] Code splitting (route-based)
- [x] Performance utilities (debounce, throttle)
- [x] Client-side caching
- [ ] Image lazy loading
- [ ] Component lazy loading
- [ ] Bundle size analysis
- [ ] Tree shaking optimization
- [ ] Service worker (PWA)

### Monitoring
- [x] Sentry error tracking
- [x] Winston logging
- [ ] Performance metrics dashboard
- [ ] Real user monitoring (RUM)
- [ ] Synthetic monitoring

---

## Performance Targets

### Page Load Times
- **Homepage:** < 2s (LCP)
- **Dashboard:** < 3s (LCP)
- **Form Pages:** < 2.5s (LCP)

### API Response Times
- **Simple queries:** < 100ms
- **Complex queries:** < 500ms
- **Report generation:** < 3s

### Database Queries
- **Index usage:** 100%
- **Query time:** < 50ms average
- **Connection pool:** 10-20 connections

---

## Optimization Roadmap

### Phase 1: Quick Wins (Done)
- ✅ Rate limiting
- ✅ Compression
- ✅ Security headers
- ✅ Query caching utility
- ✅ Performance utilities

### Phase 2: Image & Asset Optimization
- [ ] Implement lazy loading
- [ ] Add responsive images
- [ ] Convert to WebP format
- [ ] Setup CDN

### Phase 3: Code Splitting
- [ ] Route-based code splitting
- [ ] Component lazy loading
- [ ] Bundle size analysis
- [ ] Tree shaking optimization

### Phase 4: Advanced Caching
- [ ] Redis caching layer
- [ ] Service worker (PWA)
- [ ] API response caching
- [ ] Static asset caching

### Phase 5: Monitoring & Optimization
- [ ] Performance dashboard
- [ ] Real user monitoring
- [ ] A/B testing framework
- [ ] Continuous optimization

---

## Best Practices

### General
1. **Measure first** - Use profiling tools before optimizing
2. **Optimize bottlenecks** - Focus on the slowest parts
3. **Monitor continuously** - Track metrics over time
4. **Test thoroughly** - Ensure optimizations don't break functionality

### Backend
1. **Cache aggressively** - But invalidate correctly
2. **Index strategically** - Add indexes for frequent queries
3. **Paginate always** - Never return unbounded lists
4. **Compress responses** - Enable gzip/brotli

### Frontend
1. **Lazy load everything** - Images, components, routes
2. **Minimize bundle** - Code split and tree shake
3. **Optimize images** - Compress and use modern formats
4. **Cache intelligently** - Balance freshness and performance

---

## Troubleshooting

### Slow Database Queries
```bash
# Enable MySQL slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; # Log queries > 1s

# Analyze slow queries
SELECT * FROM mysql.slow_log;
```

### Large Bundle Size
```bash
# Analyze bundle
pnpm build
pnpm analyze

# Check for duplicate dependencies
pnpm dedupe
```

### Memory Leaks
```typescript
// Use Chrome DevTools Memory Profiler
// Look for detached DOM nodes
// Check for event listener leaks
```

### High Server Load
```bash
# Check CPU usage
top

# Check memory usage
free -m

# Check database connections
SHOW PROCESSLIST;
```

---

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [MySQL Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
