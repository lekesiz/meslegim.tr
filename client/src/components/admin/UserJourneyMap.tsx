import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import {
  Loader2,
  Search,
  ArrowLeft,
  UserCircle,
  LogIn,
  BookOpen,
  CheckCircle2,
  FileText,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Event type to icon and color mapping
const EVENT_CONFIG: Record<string, { icon: typeof LogIn; color: string; bgColor: string }> = {
  registration: { icon: UserCircle, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  login: { icon: LogIn, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800/30' },
  stage_unlock: { icon: BookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  stage_complete: { icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  answer_submit: { icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  report_created: { icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  report_approved: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  purchase: { icon: CreditCard, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
};

function getEventConfig(eventType: string) {
  return EVENT_CONFIG[eventType] || { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800/30' };
}

function formatTimestamp(ts: string) {
  try {
    return format(new Date(ts), 'dd MMM yyyy HH:mm', { locale: tr });
  } catch {
    return ts;
  }
}

function formatDateShort(ts: string) {
  try {
    return format(new Date(ts), 'dd MMM yyyy', { locale: tr });
  } catch {
    return ts;
  }
}

// Filter for event types to show (exclude frequent login events by default)
type EventFilter = 'all' | 'milestones' | 'stages' | 'reports' | 'purchases';

export function UserJourneyMap() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [eventFilter, setEventFilter] = useState<EventFilter>('milestones');

  const pageSize = 15;

  // User list query
  const { data: userList, isLoading: listLoading } = trpc.admin.getUserJourneyList.useQuery({
    search: searchQuery || undefined,
    limit: pageSize,
    offset: page * pageSize,
  });

  // Journey detail query
  const { data: journey, isLoading: journeyLoading } = trpc.admin.getUserJourneyMap.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!journey?.events) return [];
    switch (eventFilter) {
      case 'milestones':
        return journey.events.filter(e => e.eventType !== 'login');
      case 'stages':
        return journey.events.filter(e => ['stage_unlock', 'stage_complete', 'answer_submit'].includes(e.eventType));
      case 'reports':
        return journey.events.filter(e => ['report_created', 'report_approved'].includes(e.eventType));
      case 'purchases':
        return journey.events.filter(e => e.eventType === 'purchase');
      default:
        return journey.events;
    }
  }, [journey?.events, eventFilter]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, typeof filteredEvents> = {};
    for (const event of filteredEvents) {
      const dateKey = formatDateShort(event.timestamp);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    }
    return groups;
  }, [filteredEvents]);

  // Calculate bottleneck analysis
  const bottleneckAnalysis = useMemo(() => {
    if (!journey?.events || journey.events.length < 2) return null;
    
    const milestones = journey.events.filter(e => 
      ['registration', 'stage_unlock', 'stage_complete', 'report_created', 'purchase'].includes(e.eventType)
    );
    
    if (milestones.length < 2) return null;

    const gaps: Array<{ from: string; to: string; durationDays: number; fromEvent: string; toEvent: string }> = [];
    for (let i = 1; i < milestones.length; i++) {
      const prev = new Date(milestones[i - 1].timestamp);
      const curr = new Date(milestones[i].timestamp);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 3) {
        gaps.push({
          from: milestones[i - 1].timestamp,
          to: milestones[i].timestamp,
          durationDays: diffDays,
          fromEvent: milestones[i - 1].eventLabel,
          toEvent: milestones[i].eventLabel,
        });
      }
    }
    
    return gaps.sort((a, b) => b.durationDays - a.durationDays).slice(0, 3);
  }, [journey?.events]);

  // Detail view
  if (selectedUserId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Geri
          </Button>
          <h3 className="text-lg font-semibold">Kullanıcı Yolculuk Haritası</h3>
        </div>

        {journeyLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : journey ? (
          <div className="space-y-4">
            {/* User Summary Card */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{journey.userName || 'İsimsiz'}</p>
                      <p className="text-sm text-muted-foreground">{journey.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-auto">
                    <Badge variant="outline">{journey.ageGroup || 'Yaş grubu yok'}</Badge>
                    {journey.isPremium && <Badge className="bg-amber-500 text-white">Premium</Badge>}
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDateShort(journey.registeredAt)}
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">İlerleme</span>
                    <span className="font-medium">%{journey.completionPercent}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${journey.completionPercent}%` }}
                    />
                  </div>
                  {journey.currentStage && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Mevcut etap: <span className="font-medium">{journey.currentStage}</span>
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Toplam Olay</p>
                    <p className="text-lg font-bold">{journey.events.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Tamamlanan Etap</p>
                    <p className="text-lg font-bold">
                      {journey.events.filter(e => e.eventType === 'stage_complete').length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Raporlar</p>
                    <p className="text-lg font-bold">
                      {journey.events.filter(e => e.eventType === 'report_created').length}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Giriş Sayısı</p>
                    <p className="text-lg font-bold">
                      {journey.events.filter(e => e.eventType === 'login').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottleneck Analysis */}
            {bottleneckAnalysis && bottleneckAnalysis.length > 0 && (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    Takılma Noktaları (Bottleneck Analizi)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bottleneckAnalysis.map((gap, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="text-muted-foreground">{gap.fromEvent}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">{gap.toEvent}</span>
                        <Badge variant="outline" className="ml-auto text-amber-700 border-amber-300">
                          {gap.durationDays} gün
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Filter */}
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'milestones', label: 'Kilometre Taşları' },
                { value: 'all', label: 'Tüm Olaylar' },
                { value: 'stages', label: 'Etaplar' },
                { value: 'reports', label: 'Raporlar' },
                { value: 'purchases', label: 'Satın Almalar' },
              ] as const).map(f => (
                <Button
                  key={f.value}
                  variant={eventFilter === f.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEventFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Yolculuk Zaman Çizelgesi ({filteredEvents.length} olay)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">Bu filtrede olay bulunamadı</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedEvents).map(([date, events]) => (
                      <div key={date}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-xs font-medium text-muted-foreground px-2">{date}</span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="relative ml-4">
                          {/* Vertical line */}
                          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                          
                          <div className="space-y-3">
                            {events.map((event, idx) => {
                              const config = getEventConfig(event.eventType);
                              const Icon = config.icon;
                              return (
                                <div key={idx} className="relative flex items-start gap-3 pl-2">
                                  {/* Dot on timeline */}
                                  <div className={`relative z-10 flex items-center justify-center h-6 w-6 rounded-full ${config.bgColor} shrink-0`}>
                                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-medium">{event.eventLabel}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(event.timestamp), 'HH:mm', { locale: tr })}
                                      </span>
                                    </div>
                                    {event.details && (
                                      <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Kullanıcı bulunamadı</p>
          </div>
        )}
      </div>
    );
  }

  // User list view
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Kullanıcı Yolculuk Haritası</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Her kullanıcının platform üzerindeki adımlarını zaman çizelgesi olarak görüntüleyin ve takılma noktalarını tespit edin.
      </p>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="İsim veya email ile ara..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          className="pl-10"
        />
      </div>

      {/* User list */}
      {listLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : userList && userList.users.length > 0 ? (
        <>
          <div className="space-y-2">
            {userList.users.map(u => (
              <Card
                key={u.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setSelectedUserId(u.id)}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{u.name || 'İsimsiz'}</p>
                        <Badge variant="outline" className="text-xs shrink-0">{u.ageGroup || '-'}</Badge>
                        {u.purchasedPackage && u.purchasedPackage !== 'free' && (
                          <Badge className="bg-amber-500 text-white text-xs shrink-0">Premium</Badge>
                        )}
                        <Badge variant={u.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
                          {u.status === 'active' ? 'Aktif' : u.status === 'pending' ? 'Bekliyor' : 'Pasif'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Etap</p>
                        <p className="text-sm font-medium">{u.completedStages}/{u.totalStages}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Olaylar</p>
                        <p className="text-sm font-medium">{u.eventCount}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  {u.totalStages > 0 && (
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.round((u.completedStages / u.totalStages) * 100)}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {userList.total > pageSize && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Toplam {userList.total} kullanıcı, sayfa {page + 1}/{Math.ceil(userList.total / pageSize)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page + 1) * pageSize >= userList.total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <Users className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">
            {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz öğrenci kaydı yok'}
          </p>
        </div>
      )}
    </div>
  );
}

export default UserJourneyMap;
