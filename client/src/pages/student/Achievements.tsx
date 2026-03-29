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
  common: "bg-zinc-100 text-zinc-700 border-zinc-300",
  uncommon: "bg-green-50 text-green-700 border-green-300",
  rare: "bg-blue-50 text-blue-700 border-blue-300",
  epic: "bg-purple-50 text-purple-700 border-purple-300",
  legendary: "bg-amber-50 text-amber-700 border-amber-300",
};

function XPBar({ totalXP, maxXP = 1000 }: { totalXP: number; maxXP?: number }) {
  const level = Math.floor(totalXP / 200) + 1;
  const currentLevelXP = totalXP % 200;
  const progress = (currentLevelXP / 200) * 100;

  return (
    <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Trophy className="h-7 w-7 text-yellow-300" />
            </div>
            <div>
              <p className="text-sm text-white/80">Seviye</p>
              <p className="text-3xl font-bold">{level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Toplam XP</p>
            <p className="text-3xl font-bold">{totalXP}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/80">
            <span>Seviye {level}</span>
            <span>{currentLevelXP}/200 XP</span>
            <span>Seviye {level + 1}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
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
        "relative group rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer",
        badge.earned
          ? "bg-white border-indigo-200 shadow-md hover:shadow-lg hover:-translate-y-1"
          : "bg-zinc-50 border-zinc-200 opacity-60 grayscale hover:opacity-80"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rarity indicator */}
      {badge.earned && (
        <div className="absolute -top-2 -right-2">
          <Badge className={cn("text-xs border", rarityColors[badge.rarity] || rarityColors.common)}>
            {rarityLabels[badge.rarity] || badge.rarity}
          </Badge>
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center text-3xl transition-transform duration-300",
            badge.earned ? "scale-100" : "scale-90",
            isHovered && badge.earned && "scale-110"
          )}
          style={{
            backgroundColor: badge.earned ? `${badge.color}20` : "#f4f4f5",
          }}
        >
          {badge.earned ? (
            <span>{badge.icon}</span>
          ) : (
            <Lock className="h-6 w-6 text-zinc-400" />
          )}
        </div>

        {/* Name */}
        <h3 className={cn("font-semibold text-sm", badge.earned ? "text-zinc-900" : "text-zinc-500")}>
          {badge.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-500 line-clamp-2">{badge.description}</p>

        {/* XP */}
        <div className="flex items-center gap-1">
          <Sparkles className={cn("h-3 w-3", badge.earned ? "text-yellow-500" : "text-zinc-400")} />
          <span className={cn("text-xs font-medium", badge.earned ? "text-yellow-600" : "text-zinc-400")}>
            +{badge.xpReward} XP
          </span>
        </div>

        {/* Earned date */}
        {badge.earned && badge.earnedAt && (
          <p className="text-xs text-indigo-500">
            {new Date(badge.earnedAt).toLocaleDateString("tr-TR")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Achievements() {
  const { data, isLoading } = trpc.badge.getMyBadges.useQuery();
  const checkMutation = trpc.badge.checkNewBadges.useMutation({
    onSuccess: () => {
      // Refetch badges after check
      void trpc.useUtils().badge.getMyBadges.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-zinc-100 rounded-xl animate-pulse" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Award className="h-7 w-7 text-indigo-600" />
            Başarılarım
          </h1>
          <p className="text-zinc-500 mt-1">
            {earnedCount}/{totalCount} rozet kazanıldı
          </p>
        </div>
        <button
          onClick={() => checkMutation.mutate()}
          disabled={checkMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {checkMutation.isPending ? "Kontrol ediliyor..." : "Rozet Kontrol Et"}
        </button>
      </div>

      {/* New badges notification */}
      {checkMutation.data && checkMutation.data.newBadges.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">
                Tebrikler! {checkMutation.data.newBadges.length} yeni rozet kazandınız!
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {checkMutation.data.newBadges.map((b) => (
                <Badge key={b.id} className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {b.icon} {b.name} (+{b.xpReward} XP)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* XP Bar */}
      <XPBar totalXP={totalXP} />

      {/* Progress overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700">Genel İlerleme</span>
            <span className="text-sm text-zinc-500">
              {earnedCount}/{totalCount} ({Math.round((earnedCount / totalCount) * 100)}%)
            </span>
          </div>
          <Progress value={(earnedCount / totalCount) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Badges by category */}
      <Tabs defaultValue="all">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Tümü ({badges.length})
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs">
              {categoryIcons[cat]}
              <span className="ml-1">
                {categoryLabels[cat] || cat} ({badges.filter((b) => b.category === cat).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
                {categoryIcons[cat]}
                {categoryLabels[cat] || cat}
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
      <Card className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-zinc-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Liderlik Tablosu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardMini />
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardMini() {
  const { data, isLoading } = trpc.badge.getLeaderboard.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-zinc-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-zinc-500">Henüz liderlik tablosunda kimse yok. İlk sen ol!</p>;
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-2">
      {data.map((entry, idx) => (
        <div
          key={entry.userId}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            idx === 0 ? "bg-amber-50 border border-amber-200" : "bg-white border border-zinc-100"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg w-8 text-center">
              {idx < 3 ? medals[idx] : `${idx + 1}.`}
            </span>
            <span className="font-medium text-zinc-800">{entry.userName || "Anonim"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {entry.badgeCount} rozet
            </Badge>
            <span className="font-bold text-indigo-600">{entry.totalXP} XP</span>
          </div>
        </div>
      ))}
    </div>
  );
}
