import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User, GraduationCap, Building2, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  type: 'student' | 'mentor' | 'school' | 'stage';
  id: number;
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Keyboard shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Search users (admin only)
  const { data: users } = trpc.admin.getUsers.useQuery(undefined, {
    enabled: isAdmin && open && query.length >= 2,
  });

  // Search schools
  const { data: schools } = trpc.school.getAll.useQuery(undefined, {
    enabled: isAdmin && open && query.length >= 2,
  });

  // Build results from data
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const newResults: SearchResult[] = [];

    // Search users
    if (users && isAdmin) {
      users
        .filter((u: any) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((u: any) => {
          const icon = u.role === 'mentor' ? 'mentor' : 'student';
          newResults.push({
            type: icon as any,
            id: u.id,
            title: u.name || 'İsimsiz',
            subtitle: `${u.email || ''} - ${u.role === 'admin' ? 'Admin' : u.role === 'mentor' ? 'Mentor' : u.role === 'school_admin' ? 'Okul Yöneticisi' : 'Öğrenci'}`,
            href: `/dashboard/admin`,
          });
        });
    }

    // Search schools
    if (schools && isAdmin) {
      schools
        .filter((s: any) => s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((s: any) => {
          newResults.push({
            type: 'school',
            id: s.id,
            title: s.name,
            subtitle: `${s.city || ''} ${s.district || ''} - ${s.status === 'active' ? 'Aktif' : 'Pasif'}`,
            href: `/dashboard/admin`,
          });
        });
    }

    // Static pages
    const pages = [
      { title: 'Ana Sayfa', subtitle: 'Meslegim.tr ana sayfası', href: '/' },
      { title: 'Fiyatlandırma', subtitle: 'Paketler ve fiyatlar', href: '/fiyatlandirma' },
      { title: 'Dashboard', subtitle: 'Kontrol paneli', href: '/dashboard' },
      { title: 'Hakkımızda', subtitle: 'Meslegim.tr hakkında', href: '/hakkimizda' },
      { title: 'İletişim', subtitle: 'Bize ulaşın', href: '/iletisim' },
      { title: 'Gizlilik Politikası', subtitle: 'Gizlilik ve veri koruma', href: '/gizlilik-politikasi' },
    ];

    pages
      .filter(p => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q))
      .forEach(p => {
        newResults.push({
          type: 'stage',
          id: 0,
          title: p.title,
          subtitle: p.subtitle,
          href: p.href,
        });
      });

    setResults(newResults);
    setSelectedIndex(0);
  }, [query, users, schools, isAdmin]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setLocation(result.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'student': return <GraduationCap className="h-4 w-4 text-green-500" />;
      case 'mentor': return <User className="h-4 w-4 text-blue-500" />;
      case 'school': return <Building2 className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border rounded-lg hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Ara...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background border rounded">
          Ctrl K
        </kbd>
      </button>

      {/* Search dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-lg gap-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 border-b">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              ref={inputRef}
              placeholder="Kullanıcı, okul veya sayfa ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 shadow-none focus-visible:ring-0 h-12"
            />
          </div>

          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-2">
              {results.map((result, i) => (
                <button
                  key={`${result.type}-${result.id}-${i}`}
                  onClick={() => handleSelect(result)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                    i === selectedIndex ? 'bg-muted/50' : ''
                  }`}
                >
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Sonuç bulunamadı
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Aramak için en az 2 karakter yazın
            </div>
          )}

          <div className="flex items-center gap-4 px-4 py-2 border-t text-[10px] text-muted-foreground">
            <span><kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> Gezin</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> Seç</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> Kapat</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
