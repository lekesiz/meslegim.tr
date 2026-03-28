import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: count = 0 } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const { data: notifs = [] } = trpc.notifications.list.useQuery(undefined, {
    enabled: open,
  });
  const utils = trpc.useUtils();

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return "Az önce";
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return d.toLocaleDateString("tr-TR");
  };

  const typeColors: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Bildirimler</h4>
          {count > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs gap-1 h-7"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="h-3 w-3" /> Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Henüz bildiriminiz yok
            </div>
          ) : (
            <div className="divide-y">
              {notifs.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer ${!n.isRead ? "bg-blue-50/50" : ""}`}
                  onClick={() => {
                    if (!n.isRead) markAsRead.mutate({ notificationId: n.id });
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] px-1.5 py-0 ${typeColors[n.type] || typeColors.info}`}>
                          {n.type === 'success' ? 'Başarılı' : n.type === 'warning' ? 'Uyarı' : n.type === 'error' ? 'Hata' : 'Bilgi'}
                        </Badge>
                        {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="font-medium text-xs">{n.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(n.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
