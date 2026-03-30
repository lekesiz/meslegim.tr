import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MessageSquareHeart, TrendingUp, TrendingDown, Minus } from "lucide-react";

function NpsScoreBadge({ score }: { score: number }) {
  if (score >= 9) return <Badge className="bg-green-500 hover:bg-green-600">{score}</Badge>;
  if (score >= 7) return <Badge className="bg-yellow-500 hover:bg-yellow-600">{score}</Badge>;
  return <Badge className="bg-red-500 hover:bg-red-600">{score}</Badge>;
}

export function PilotFeedbackPanel() {
  const { data: feedbacks, isLoading: feedbacksLoading } = trpc.pilotFeedback.getAll.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.pilotFeedback.getStats.useQuery();

  if (feedbacksLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NPS İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Toplam Yanıt</p>
            <p className="text-3xl font-bold">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">NPS Skoru</p>
            <p className={`text-3xl font-bold ${
              (stats?.npsScore || 0) > 0 ? "text-green-600" : (stats?.npsScore || 0) < 0 ? "text-red-600" : "text-muted-foreground"
            }`}>
              {stats?.npsScore || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Ort. Puan</p>
            <p className="text-3xl font-bold">{stats?.avgNps || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" /> Destekçi (9-10)
            </p>
            <p className="text-3xl font-bold text-green-600">{stats?.promoters || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Minus className="h-3 w-3 text-yellow-500" /> Pasif (7-8)
            </p>
            <p className="text-3xl font-bold text-yellow-600">{stats?.passives || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" /> Eleştiren (0-6)
            </p>
            <p className="text-3xl font-bold text-red-600">{stats?.detractors || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Geri Bildirim Listesi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5" />
            Pilot Kullanıcı Geri Bildirimleri
          </CardTitle>
          <CardDescription>
            Pilot kullanıcılardan gelen NPS skorları ve açık uçlu geri bildirimler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!feedbacks || feedbacks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Henüz geri bildirim alınmadı.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">NPS</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Beğenilen</TableHead>
                  <TableHead>İyileştirilmeli</TableHead>
                  <TableHead>Ek Yorum</TableHead>
                  <TableHead className="w-20">Önerir</TableHead>
                  <TableHead className="w-32">Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((fb: any) => (
                  <TableRow key={fb.id}>
                    <TableCell>
                      <NpsScoreBadge score={fb.npsScore} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {fb.userName || fb.userEmail || "Anonim"}
                    </TableCell>
                    <TableCell className="max-w-48 truncate" title={fb.whatWorkedWell || ""}>
                      {fb.whatWorkedWell || "-"}
                    </TableCell>
                    <TableCell className="max-w-48 truncate" title={fb.whatNeedsImprovement || ""}>
                      {fb.whatNeedsImprovement || "-"}
                    </TableCell>
                    <TableCell className="max-w-48 truncate" title={fb.additionalComments || ""}>
                      {fb.additionalComments || "-"}
                    </TableCell>
                    <TableCell>
                      {fb.wouldRecommend === true ? (
                        <Badge variant="outline" className="text-green-600 border-green-300">Evet</Badge>
                      ) : fb.wouldRecommend === false ? (
                        <Badge variant="outline" className="text-red-600 border-red-300">Hayır</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("tr-TR") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
