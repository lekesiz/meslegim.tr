import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const { data: count = 0 } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
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
    success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    error: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  };

  const typeLabels: Record<string, string> = {
    success: "Başarılı",
    warning: "Uyarı",
    error: "Hata",
    info: "Bilgi",
  };

  const filteredNotifs = tab === "unread" 
    ? notifs.filter((n) => !n.isRead) 
    : notifs;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Bildirimler</h4>
          {count > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs gap-1 h-7"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="h-3 w-3" /> Tümünü Okundu
            </Button>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full rounded-none border-b h-9">
            <TabsTrigger value="all" className="flex-1 text-xs">
              Tümü ({notifs.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 text-xs">
              Okunmamış ({notifs.filter(n => !n.isRead).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="max-h-80">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {tab === "unread" ? "Okunmamış bildiriminiz yok" : "Henüz bildiriminiz yok"}
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer ${!n.isRead ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                  onClick={() => {
                    if (!n.isRead) markAsRead.mutate({ notificationId: n.id });
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] px-1.5 py-0 ${typeColors[n.type] || typeColors.info}`}>
                          {typeLabels[n.type] || "Bilgi"}
                        </Badge>
                        {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
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
