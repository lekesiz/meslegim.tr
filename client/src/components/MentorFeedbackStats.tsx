import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MentorFeedbackStats() {
  const { data: feedbackStats, isLoading: statsLoading } = trpc.mentor.getFeedbackStats.useQuery();
  const { data: feedbacks, isLoading: feedbacksLoading } = trpc.mentor.getMyFeedbacks.useQuery();

  if (statsLoading || feedbacksLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!feedbackStats || feedbackStats.totalFeedbacks === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Henüz geri bildirim bulunmuyor.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = Object.entries(feedbackStats.ratingDistribution).map(([rating, count]) => ({
    rating: `${rating} Yıldız`,
    count,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {feedbackStats.averageRating.toFixed(1)}
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(feedbackStats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {feedbackStats.totalFeedbacks} değerlendirme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Geri Bildirim</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackStats.totalFeedbacks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Öğrencilerinizden gelen değerlendirmeler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Puan Dağılımı</CardTitle>
          <CardDescription>Aldığınız puanların dağılımı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle>Son Geri Bildirimler</CardTitle>
          <CardDescription>Öğrencilerinizden gelen yorumlar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbacks && feedbacks.length > 0 ? (
              feedbacks.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {feedback.rating}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  {feedback.comment && (
                    <p className="text-sm text-muted-foreground italic">
                      "{feedback.comment}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Henüz yorum bulunmuyor.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
