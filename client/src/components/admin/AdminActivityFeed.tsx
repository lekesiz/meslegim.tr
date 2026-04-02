import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, BellOff, CheckCheck, Loader2, UserPlus, CreditCard, 
  FileText, AlertCircle, CheckCircle2, Info, AlertTriangle,
  ExternalLink, RefreshCw
} from 'lucide-react';
import { useLocation } from 'wouter';

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const typeColors: Record<string, string> = {
  info: 'border-l-blue-500',
  success: 'border-l-green-500',
  warning: 'border-l-yellow-500',
  error: 'border-l-red-500',
};

function getEventIcon(title: string) {
  if (title.includes('Kayıt') || title.includes('Öğrenci')) return <UserPlus className="h-4 w-4 text-blue-500" />;
  if (title.includes('Satın') || title.includes('💳')) return <CreditCard className="h-4 w-4 text-green-500" />;
  if (title.includes('Rapor') || title.includes('📝')) return <FileText className="h-4 w-4 text-purple-500" />;
  return null;
}

export function AdminActivityFeed() {
  const [, setLocation] = useLocation();
  const { data: feed, isLoading, refetch, isFetching } = trpc.admin.getAdminActivityFeed.useQuery(
    { limit: 50 },
    { refetchInterval: 30000 } // 30 saniyede bir otomatik yenile
  );
  const { data: unreadCount } = trpc.admin.getAdminUnreadCount.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const utils = trpc.useUtils();

  const markReadMutation = trpc.admin.markAdminNotificationRead.useMutation({
    onSuccess: () => {
      utils.admin.getAdminActivityFeed.invalidate();
      utils.admin.getAdminUnreadCount.invalidate();
    },
  });

  const markAllReadMutation = trpc.admin.markAllAdminNotificationsRead.useMutation({
    onSuccess: () => {
      utils.admin.getAdminActivityFeed.invalidate();
      utils.admin.getAdminUnreadCount.invalidate();
    },
  });

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHour < 24) return `${diffHour} sa önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Bildirim Akışı</CardTitle>
            {(unreadCount ?? 0) > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            {(unreadCount ?? 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Tümünü Oku
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!feed || feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BellOff className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Henüz bildirim yok</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-1">
              {feed.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-2 transition-colors cursor-pointer hover:bg-muted/50 ${
                    !item.isRead ? 'bg-muted/30' : ''
                  } ${typeColors[item.type] || 'border-l-gray-300'}`}
                  onClick={() => {
                    if (!item.isRead) {
                      markReadMutation.mutate({ notificationId: item.id });
                    }
                    if (item.link) {
                      setLocation(item.link);
                    }
                  }}
                >
                  <div className="mt-0.5 shrink-0">
                    {getEventIcon(item.title) || typeIcons[item.type] || typeIcons.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${!item.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-muted-foreground/70">
                        {formatTime(item.createdAt)}
                      </span>
                      {item.link && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
