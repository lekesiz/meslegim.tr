import { useState, useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Clock, TrendingUp } from 'lucide-react';

export default function ActiveUsersWidget() {
  const [refreshKey, setRefreshKey] = useState(0);

  // 30 saniyede bir yenile
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const { data: activeData, isLoading: countLoading } = trpc.admin.getActiveUserCount.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );

  const { data: trendData, isLoading: trendLoading } = trpc.admin.getHourlyActiveUserTrend.useQuery(
    undefined,
    { refetchInterval: 60000 }
  );

  // Mini trend grafiği için veri hazırla
  const trendPoints = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];
    const maxVal = Math.max(...trendData.map((d: any) => d.activeUsers), 1);
    return trendData.map((d: any) => ({
      hour: d.hour,
      value: d.activeUsers,
      height: Math.max((d.activeUsers / maxVal) * 100, 4),
    }));
  }, [trendData]);

  // Son 1 saatlik trend hesapla
  const hourTrend = useMemo(() => {
    if (!trendData || trendData.length < 2) return null;
    const recent = trendData.slice(-2);
    const prev = (recent[0] as any).activeUsers;
    const curr = (recent[1] as any).activeUsers;
    if (prev === 0) return null;
    const change = ((curr - prev) / prev) * 100;
    return { change: Math.round(change), direction: change >= 0 ? 'up' : 'down' };
  }, [trendData]);

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Aktif Kullanıcılar
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Canlı
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {countLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        ) : (
          <>
            {/* Ana sayaç */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeData?.activeNow ?? 0}
              </span>
              <span className="text-sm text-muted-foreground mb-1">şu anda aktif</span>
              {hourTrend && (
                <Badge 
                  variant="secondary" 
                  className={`ml-auto text-xs ${
                    hourTrend.direction === 'up' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  }`}
                >
                  <TrendingUp className={`h-3 w-3 mr-1 ${hourTrend.direction === 'down' ? 'rotate-180' : ''}`} />
                  {hourTrend.direction === 'up' ? '+' : ''}{hourTrend.change}%
                </Badge>
              )}
            </div>

            {/* Alt metrikler */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Son 1 saat:</span>
                <span className="font-semibold">{activeData?.active1h ?? 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Son 24 saat:</span>
                <span className="font-semibold">{activeData?.active24h ?? 0}</span>
              </div>
            </div>

            {/* Mini trend grafiği */}
            {trendPoints.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-2">Son 24 Saat Trendi</p>
                <div className="flex items-end gap-[2px] h-12">
                  {trendPoints.map((point: any, i: number) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm transition-all duration-300 bg-emerald-400/60 dark:bg-emerald-500/40 hover:bg-emerald-500 dark:hover:bg-emerald-400"
                      style={{ height: `${point.height}%` }}
                      title={`${point.hour}: ${point.value} aktif kullanıcı`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
