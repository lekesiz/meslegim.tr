# UX Improvements Guide

Meslegim.tr projesi için kullanıcı deneyimi iyileştirmeleri ve best practices.

## Implemented Components

### 1. Empty States

Empty state component'i boş liste, data yok veya hata durumları için kullanılır.

#### Usage
```typescript
import { EmptyState } from '@/components/EmptyState';
import { FileQuestion } from 'lucide-react';

<EmptyState
  icon={FileQuestion}
  title="Henüz Etap Yok"
  description="Mentor onayından sonra ilk etabınız aktif olacak ve burada görünecek."
  action={{
    label: "Yenile",
    onClick: () => refetch()
  }}
/>
```

#### Best Practices
- ✅ Her boş liste için empty state kullan
- ✅ Açıklayıcı icon seç (lucide-react)
- ✅ Kullanıcıya ne yapması gerektiğini söyle
- ✅ Mümkünse action button ekle
- ❌ "Veri yok" gibi teknik mesajlar kullanma

### 2. Loading Animations

Farklı loading senaryoları için çeşitli animasyonlar.

#### LoadingAnimation (Spinner)
```typescript
import { LoadingAnimation } from '@/components/LoadingAnimation';

<LoadingAnimation 
  size="lg" 
  text="Raporunuz hazırlanıyor..." 
/>
```

#### DotsLoading
```typescript
import { DotsLoading } from '@/components/LoadingAnimation';

<DotsLoading className="my-4" />
```

#### PulseLoading
```typescript
import { PulseLoading } from '@/components/LoadingAnimation';

<PulseLoading />
```

#### SpinnerLoading
```typescript
import { SpinnerLoading } from '@/components/LoadingAnimation';

<SpinnerLoading size="md" />
```

#### Best Practices
- ✅ Her async işlem için loading state göster
- ✅ Loading text ekle (kullanıcı ne beklediğini bilmeli)
- ✅ Skeleton loader kullan (data shape belli ise)
- ✅ Optimistic updates kullan (mümkünse)
- ❌ Tüm sayfayı blokla (sadece ilgili bölümü)

### 3. Progress Indicators

Çok adımlı süreçler için progress göstergeleri.

#### Step Progress
```typescript
import { ProgressIndicator } from '@/components/ProgressIndicator';

const steps = [
  { id: 1, title: 'Etap 1', status: 'completed' },
  { id: 2, title: 'Etap 2', status: 'current' },
  { id: 3, title: 'Etap 3', status: 'upcoming' },
];

<ProgressIndicator steps={steps} />
```

#### Circular Progress
```typescript
import { CircularProgress } from '@/components/ProgressIndicator';

<CircularProgress 
  value={75} 
  size={120} 
  showValue={true} 
/>
```

#### Linear Progress
```typescript
import { LinearProgress } from '@/components/ProgressIndicator';

<LinearProgress 
  value={60} 
  label="Profil Tamamlama" 
  showValue={true} 
/>
```

#### Best Practices
- ✅ Çok adımlı formlarda step indicator kullan
- ✅ İlerleme yüzdesini göster
- ✅ Tamamlanan adımları vurgula
- ✅ Kullanıcı hangi adımda olduğunu bilmeli
- ❌ Çok fazla adım gösterme (max 5-6)

---

## UX Patterns

### 1. Form Validation

#### Real-time Validation
```typescript
const form = useForm({
  mode: 'onChange', // Real-time validation
});

<Input
  {...form.register('email', {
    required: 'E-posta gerekli',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Geçersiz e-posta adresi'
    }
  })}
  error={form.formState.errors.email?.message}
/>
```

#### Best Practices
- ✅ Inline validation (kullanıcı yazdıkça)
- ✅ Açıklayıcı hata mesajları
- ✅ Success state göster (yeşil check)
- ✅ Disabled state'te submit button
- ❌ Form submit sonrası hata gösterme

### 2. Feedback Messages

#### Success Toast
```typescript
import { toast } from 'sonner';

toast.success('Başarılı!', {
  description: 'Değişiklikler kaydedildi.',
});
```

#### Error Toast
```typescript
toast.error('Hata!', {
  description: 'Bir şeyler ters gitti. Lütfen tekrar deneyin.',
});
```

#### Loading Toast
```typescript
const promise = saveData();

toast.promise(promise, {
  loading: 'Kaydediliyor...',
  success: 'Kaydedildi!',
  error: 'Kaydedilemedi.',
});
```

#### Best Practices
- ✅ Her işlem sonrası feedback ver
- ✅ Success/error/warning durumlarını ayır
- ✅ Auto-dismiss (3-5 saniye)
- ✅ Action button ekle (undo, retry)
- ❌ Çok fazla toast gösterme

### 3. Micro-interactions

#### Button Hover Effects
```css
/* Already in Tailwind */
<Button className="hover:scale-105 transition-transform">
  Gönder
</Button>
```

#### Card Hover
```css
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  ...
</Card>
```

#### Input Focus
```css
<Input className="focus:ring-2 focus:ring-primary transition-all" />
```

#### Best Practices
- ✅ Hover state ekle (tüm interactive elementlerde)
- ✅ Focus state göster (accessibility)
- ✅ Transition kullan (smooth animations)
- ✅ Active state ekle (button press)
- ❌ Çok fazla animasyon (dikkat dağıtıcı)

### 4. Skeleton Loaders

#### Card Skeleton
```typescript
import { Skeleton } from '@/components/ui/skeleton';

<Card>
  <CardHeader>
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-3 w-3/4 mt-2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>
```

#### Table Skeleton
```typescript
<Table>
  <TableBody>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Best Practices
- ✅ Data shape'i taklit et
- ✅ Gerçekçi boyutlar kullan
- ✅ Pulse animation ekle
- ✅ Loading state yerine skeleton kullan (data shape belli ise)
- ❌ Çok uzun süre gösterme (>3 saniye)

---

## Accessibility (A11y)

### 1. Keyboard Navigation

#### Focus Management
```typescript
// Auto-focus first input
<Input autoFocus />

// Trap focus in modal
import { Dialog } from '@/components/ui/dialog';

<Dialog>
  {/* Focus automatically trapped */}
</Dialog>
```

#### Tab Order
```typescript
// Control tab order
<Button tabIndex={1}>First</Button>
<Button tabIndex={2}>Second</Button>
<Button tabIndex={-1}>Skip</Button>
```

### 2. Screen Reader Support

#### ARIA Labels
```typescript
<Button aria-label="Menüyü aç">
  <Menu />
</Button>

<Input 
  aria-label="E-posta adresi"
  aria-describedby="email-help"
/>
<span id="email-help">Kayıtlı e-posta adresinizi girin</span>
```

#### ARIA Live Regions
```typescript
<div aria-live="polite" aria-atomic="true">
  {successMessage}
</div>
```

### 3. Color Contrast

#### WCAG AA Standards
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

#### Check Contrast
```bash
# Use browser DevTools
# Lighthouse > Accessibility > Contrast
```

---

## Mobile UX

### 1. Touch Targets

#### Minimum Size
```css
/* Minimum 44x44px touch target */
<Button className="min-h-[44px] min-w-[44px]">
  <Icon />
</Button>
```

#### Spacing
```css
/* Adequate spacing between touch targets */
<div className="flex gap-4">
  <Button>Kaydet</Button>
  <Button>İptal</Button>
</div>
```

### 2. Mobile Navigation

#### Bottom Navigation
```typescript
<nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
  <div className="flex justify-around p-4">
    <Button variant="ghost">Ana Sayfa</Button>
    <Button variant="ghost">Etaplar</Button>
    <Button variant="ghost">Profil</Button>
  </div>
</nav>
```

#### Hamburger Menu
```typescript
import { Menu } from 'lucide-react';

<Button variant="ghost" className="md:hidden">
  <Menu />
</Button>
```

### 3. Responsive Design

#### Breakpoints
```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

#### Mobile-First
```css
/* Default: Mobile */
<div className="text-sm">

/* Tablet and up */
<div className="text-sm md:text-base">

/* Desktop and up */
<div className="text-sm md:text-base lg:text-lg">
```

---

## Performance UX

### 1. Optimistic Updates

#### Example
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
    toast.error('Değişiklikler kaydedilemedi');
  },
  onSuccess: () => {
    toast.success('Kaydedildi!');
  },
});
```

### 2. Perceived Performance

#### Skeleton Loaders
- Show content structure immediately
- User knows what to expect

#### Progress Indicators
- Show progress for long operations
- Reduce perceived wait time

#### Instant Feedback
- Button press animation
- Optimistic updates
- Loading states

---

## Error Handling

### 1. Error States

#### Inline Errors
```typescript
<Input 
  error={errors.email?.message}
  className={errors.email ? 'border-destructive' : ''}
/>
```

#### Error Boundaries
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <StudentDashboard />
</ErrorBoundary>
```

### 2. Error Messages

#### User-Friendly
```typescript
// ❌ Bad
"Error 500: Internal server error"

// ✅ Good
"Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin."
```

#### Actionable
```typescript
// ❌ Bad
"Hata oluştu"

// ✅ Good
"Bağlantı hatası. İnternet bağlantınızı kontrol edin."
```

### 3. Retry Mechanisms

#### Automatic Retry
```typescript
const { data, isError, refetch } = trpc.students.list.useQuery(undefined, {
  retry: 3,
  retryDelay: 1000,
});
```

#### Manual Retry
```typescript
{isError && (
  <div className="text-center py-4">
    <p className="text-destructive mb-2">Yüklenemedi</p>
    <Button onClick={() => refetch()}>Tekrar Dene</Button>
  </div>
)}
```

---

## UX Checklist

### General
- [x] Empty states for all lists
- [x] Loading states for all async operations
- [x] Progress indicators for multi-step processes
- [x] Error states with actionable messages
- [ ] Success confirmations for all actions
- [ ] Undo functionality for destructive actions

### Forms
- [ ] Real-time validation
- [ ] Inline error messages
- [ ] Success states (green checkmarks)
- [ ] Disabled submit when invalid
- [ ] Clear error on input change
- [ ] Auto-focus first field

### Feedback
- [x] Toast notifications (sonner)
- [ ] Confirmation dialogs for destructive actions
- [ ] Success animations
- [ ] Error animations
- [ ] Loading animations

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support (ARIA)
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators
- [ ] Skip links

### Mobile
- [ ] Touch targets (min 44x44px)
- [ ] Bottom navigation
- [ ] Swipe gestures
- [ ] Responsive design
- [ ] Mobile-first approach

### Performance
- [x] Skeleton loaders
- [ ] Optimistic updates
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Image optimization

---

## Next Steps

### Phase 1: Component Integration
- [ ] Add EmptyState to all list views
- [ ] Replace spinners with LoadingAnimation
- [ ] Add ProgressIndicator to multi-step forms
- [ ] Add CircularProgress to dashboard

### Phase 2: Micro-interactions
- [ ] Add hover effects to all buttons
- [ ] Add transition animations
- [ ] Add focus states
- [ ] Add active states

### Phase 3: Error Handling
- [ ] Add error boundaries
- [ ] Improve error messages
- [ ] Add retry mechanisms
- [ ] Add fallback UI

### Phase 4: Accessibility
- [ ] Audit with Lighthouse
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Test screen reader

### Phase 5: Mobile Optimization
- [ ] Test on real devices
- [ ] Optimize touch targets
- [ ] Add mobile navigation
- [ ] Test gestures

---

## Resources

- [Nielsen Norman Group - UX](https://www.nngroup.com/)
- [Material Design - Motion](https://m3.material.io/styles/motion)
- [Inclusive Components](https://inclusive-components.design/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
