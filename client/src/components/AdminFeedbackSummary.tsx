import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AdminFeedbackSummary() {
  const { data: feedbackData, isLoading } = trpc.admin.getAllFeedbacksWithStats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!feedbackData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Veri yüklenemedi</p>
        </CardContent>
      </Card>
    );
  }

  const { totalFeedbacks, averageRating, mentorStats, recentFeedbacks } = feedbackData;

  // Prepare chart data
  const chartData = mentorStats.map((mentor: any) => ({
    name: mentor.mentorName || 'Bilinmeyen',
    'Ortalama Puan': mentor.averageRating,
    'Toplam Feedback': mentor.totalFeedbacks,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeedbacks}</div>
            <p className="text-xs text-muted-foreground">
              Platform geneli
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating} / 5</div>
            <p className="text-xs text-muted-foreground">
              Tüm mentorlar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Mentorlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentorStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Feedback alan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mentor Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mentor Performans Karşılaştırması</CardTitle>
          <CardDescription>Mentor başına ortalama puan ve toplam feedback sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="Ortalama Puan" fill="#8b5cf6" />
              <Bar yAxisId="right" dataKey="Toplam Feedback" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mentor Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mentor Feedback Özeti</CardTitle>
          <CardDescription>Mentor başına detaylı feedback istatistikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead className="text-right">Toplam Feedback</TableHead>
                <TableHead className="text-right">Ortalama Puan</TableHead>
                <TableHead className="text-right">Memnuniyet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentorStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Henüz feedback bulunmuyor
                  </TableCell>
                </TableRow>
              ) : (
                mentorStats.map((mentor: any) => (
                  <TableRow key={mentor.mentorId}>
                    <TableCell className="font-medium">{mentor.mentorName || 'Bilinmeyen'}</TableCell>
                    <TableCell className="text-right">{mentor.totalFeedbacks}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {mentor.averageRating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {mentor.averageRating >= 4.5 ? (
                        <span className="text-green-600 font-medium">Mükemmel</span>
                      ) : mentor.averageRating >= 4.0 ? (
                        <span className="text-blue-600 font-medium">Çok İyi</span>
                      ) : mentor.averageRating >= 3.5 ? (
                        <span className="text-yellow-600 font-medium">İyi</span>
                      ) : (
                        <span className="text-orange-600 font-medium">Geliştirilmeli</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle>Son Feedbackler</CardTitle>
          <CardDescription>En son gelen 10 feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFeedbacks.length === 0 ? (
              <p className="text-center text-muted-foreground">Henüz feedback bulunmuyor</p>
            ) : (
              recentFeedbacks.map((feedback: any) => (
                <div key={feedback.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{feedback.studentName || 'Bilinmeyen'}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground">{feedback.mentorName || 'Bilinmeyen'}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {feedback.comment && (
                      <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(feedback.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
