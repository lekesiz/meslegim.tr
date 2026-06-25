import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Zap, Lock, Sparkles, Award, Target, Shield, Users, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  milestone: "Kilometre Taşları",
  speed: "Hız & Performans",
  mastery: "Uzmanlık",
  social: "Sosyal",
  special: "Özel",
};

const categoryIcons: Record<string, React.ReactNode> = {
  milestone: <Target className="h-4 w-4" />,
  speed: <Zap className="h-4 w-4" />,
  mastery: <Star className="h-4 w-4" />,
  social: <Users className="h-4 w-4" />,
  special: <Crown className="h-4 w-4" />,
};

const rarityLabels: Record<string, string> = {
  common: "Yaygın",
  uncommon: "Nadir",
  rare: "Çok Nadir",
  epic: "Efsanevi",
  legendary: "Efsane",
};

const rarityColors: Record<string, string> = {
  common: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600",
  uncommon: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
  rare: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
  epic: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700",
  legendary: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700",
};

function XPBar({ totalXP, maxXP = 1000 }: { totalXP: number; maxXP?: number }) {
  const level = Math.floor(totalXP / 200) + 1;
  const currentLevelXP = totalXP % 200;
  const progress = (currentLevelXP / 200) * 100;

  return (
    <div className="bg-gradient-to-r from-[var(--navy)] to-[var(--steel)] text-white border-0 rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
            <Trophy className="h-7 w-7 text-[var(--gold)]" />
          </div>
          <div>
            <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">Mevcut Seviye</p>
            <p className="text-3xl font-extrabold text-white">{level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">Toplam Deneyim (XP)</p>
          <p className="text-3xl font-extrabold text-[var(--gold-light)]">{totalXP}</p>
        </div>
      </div>
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex justify-between text-xs font-semibold text-slate-200">
          <span>Seviye {level}</span>
          <span className="text-[var(--gold-light)]">{currentLevelXP} / 200 XP</span>
          <span>Seviye {level + 1}</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden w-full border border-white/5">
          <div
            className="h-full progress-bar-gold rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function BadgeCard({
  badge,
}: {
  badge: {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
    category: string;
    rarity: string;
    xpReward: number;
    earned: boolean;
    earnedAt: Date | null;
  };
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative group rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer bg-white",
        badge.earned
          ? "border-slate-100 shadow-sm hover:border-[var(--gold)]/50 hover:shadow-md hover:-translate-y-1"
          : "border-slate-100 opacity-60 grayscale hover:opacity-80"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rarity indicator */}
      {badge.earned && (
        <div className="absolute -top-2.5 -right-1">
          <Badge className={cn("text-[10px] uppercase font-bold border-none py-0.5 px-2", rarityColors[badge.rarity] || rarityColors.common)}>
            {rarityLabels[badge.rarity] || badge.rarity}
          </Badge>
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "h-16 w-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 shadow-inner border border-slate-50",
            badge.earned ? "scale-100" : "scale-90",
            isHovered && badge.earned && "scale-110"
          )}
          style={{
            backgroundColor: badge.earned ? `${badge.color}15` : "#f8fafc",
          }}
        >
          {badge.earned ? (
            <span>{badge.icon}</span>
          ) : (
            <Lock className="h-6 w-6 text-slate-400" />
          )}
        </div>

        {/* Name */}
        <h3 className={cn("font-bold text-sm tracking-tight", badge.earned ? "text-[var(--navy)]" : "text-slate-400")}>
          {badge.name}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 min-h-[32px]">{badge.description}</p>

        {/* XP */}
        <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100/50">
          <Sparkles className={cn("h-3 w-3", badge.earned ? "text-[var(--gold-dark)]" : "text-slate-400")} />
          <span className={cn("text-[10px] font-bold", badge.earned ? "text-[var(--gold-dark)]" : "text-slate-400")}>
            +{badge.xpReward} XP
          </span>
        </div>

        {/* Earned date */}
        {badge.earned && badge.earnedAt && (
          <p className="text-[10px] font-semibold text-[var(--steel)]">
            Kazanıldı: {new Date(badge.earnedAt).toLocaleDateString("tr-TR")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Achievements() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.badge.getMyBadges.useQuery();
  const checkMutation = trpc.badge.checkNewBadges.useMutation({
    onSuccess: () => {
      // Refetch badges after check
      void utils.badge.getMyBadges.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const badges = data?.badges ?? [];
  const totalXP = data?.totalXP ?? 0;
  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;

  // Group by category
  const categories = Array.from(new Set(badges.map((b) => b.category)));

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--navy)] flex items-center gap-2 tracking-tight">
            <Award className="h-8 w-8 text-[var(--gold)]" />
            Başarılarım ve Rozetlerim
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Toplam {totalCount} rozetten <span className="text-[var(--gold-dark)] font-bold">{earnedCount} tanesini</span> kazandınız.
          </p>
        </div>
        <button
          onClick={() => checkMutation.mutate()}
          disabled={checkMutation.isPending}
          className="px-5 py-2.5 bg-gradient-to-br from-[var(--navy)] to-[var(--steel)] text-white font-semibold rounded-xl hover:shadow-lg hover:from-[var(--navy-light)] hover:to-[var(--steel-light)] transition-all text-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer border-none shrink-0"
        >
          <Sparkles className="h-4 w-4 text-[var(--gold)]" />
          {checkMutation.isPending ? "Kontrol ediliyor..." : "Yeni Rozetleri Kontrol Et"}
        </button>
      </div>

      {/* New badges notification */}
      {checkMutation.data && checkMutation.data.newBadges.length > 0 && (
        <div className="bg-gradient-to-r from-[var(--gold)]/10 to-amber-50 rounded-2xl border border-[var(--gold)]/20 p-5 shadow-sm animate-fade-in-up">
          <div className="flex items-center gap-2.5 mb-3">
            <Sparkles className="h-5 w-5 text-[var(--gold-dark)]" />
            <span className="font-bold text-[var(--navy)]">
              Tebrikler! {checkMutation.data.newBadges.length} yeni rozet kazandınız!
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {checkMutation.data.newBadges.map((b) => (
              <Badge key={b.id} className="bg-[var(--gold)] text-[var(--navy)] border-none font-bold py-1 px-3">
                {b.icon} {b.name} (+{b.xpReward} XP)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* XP Bar */}
      <XPBar totalXP={totalXP} />

      {/* Progress overview */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[var(--navy)]">Genel Rozet İlerlemesi</span>
          <span className="text-xs font-bold text-[var(--gold-dark)] bg-[var(--gold)]/10 px-2.5 py-0.5 rounded-full">
            {earnedCount} / {totalCount} rozet (%{Math.round((earnedCount / totalCount) * 100)})
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden w-full">
          <div className="h-full rounded-full progress-bar-gold transition-all duration-500" style={{ width: `${(earnedCount / totalCount) * 100}%` }} />
        </div>
      </div>

      {/* Badges by category */}
      <Tabs defaultValue="all">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/50">
          <TabsTrigger value="all" className="text-xs font-semibold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
            <Shield className="h-3.5 w-3.5 mr-1 text-[var(--gold-dark)]" />
            Tümü ({badges.length})
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs font-semibold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <span className="mr-1 shrink-0">{categoryIcons[cat]}</span>
              <span>
                {categoryLabels[cat] || cat} ({badges.filter((b) => b.category === cat).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[var(--navy)] flex items-center gap-2">
                <span className="text-[var(--gold-dark)]">{categoryIcons[cat]}</span>
                {categoryLabels[cat] || cat} Ünvanları
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {badges
                .filter((b) => b.category === cat)
                .map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Leaderboard teaser */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="pb-4 mb-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--navy)] flex items-center gap-2">
            <Crown className="h-5 w-5 text-[var(--gold)]" />
            Liderlik Tablosu
          </h2>
          <span className="text-xs text-slate-400 font-medium">En yüksek XP kazanan öğrenciler</span>
        </div>
        <LeaderboardMini />
      </div>
    </div>
  );
}

function LeaderboardMini() {
  const { data, isLoading } = trpc.badge.getLeaderboard.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400">Henüz liderlik tablosunda kimse yok. İlk sen ol!</p>;
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-3">
      {data.map((entry, idx) => (
        <div
          key={entry.userId}
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
            idx === 0 
              ? "bg-[var(--gold)]/5 border-[var(--gold)]/20 shadow-sm" 
              : "bg-white border-slate-100 hover:border-slate-200"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl w-8 text-center font-bold">
              {idx < 3 ? medals[idx] : `${idx + 1}.`}
            </span>
            <span className="font-bold text-sm text-[var(--navy)]">{entry.userName || "Anonim Öğrenci"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 border-none">
              {entry.badgeCount} Rozet
            </Badge>
            <span className="font-extrabold text-sm text-[var(--steel)]">{entry.totalXP} XP</span>
          </div>
        </div>
      ))}
    </div>
  );
}
