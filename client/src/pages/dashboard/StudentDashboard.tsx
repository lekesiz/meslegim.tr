import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, Clock, CheckCircle2, Lock, Award, MessageCircle, User, MessageSquareHeart, BarChart3 } from "lucide-react";
import { ChatDialog } from "@/components/ChatDialog";
import { useState } from "react";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useLocation } from "wouter";
import StudentProgressTimeline from "@/components/StudentProgressTimeline";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: progress, isLoading: progressLoading } = trpc.student.getMyProgress.useQuery();
  const { data: activeStage, isLoading: stageLoading } = trpc.student.getActiveStage.useQuery();
  const { data: reports, isLoading: reportsLoading } = trpc.student.getMyReports.useQuery();
  const { data: certificate } = trpc.student.getMyCertificate.useQuery();
  const { data: isEligible } = trpc.student.checkCertificateEligibility.useQuery();
  
  const generateCertificate = trpc.student.generateCertificate.useMutation({
    onSuccess: () => {
      trpc.useUtils().student.getMyCertificate.invalidate();
    },
  });
  const [chatOpen, setChatOpen] = useState(false);

  if (!user) {
    return null;
  }

  if (progressLoading || stageLoading || reportsLoading) {
    return <DashboardSkeleton />;
  }

  const completedStages = progress?.filter(s => s.status === 'completed').length || 0;
  const totalStages = progress?.length || 0;
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Hoş Geldiniz, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Kariyer değerlendirme sürecinizi buradan takip edebilirsiniz.
          </p>
        </div>

        {/* Progress Timeline */}
        {progress && progress.length > 0 && (
          <StudentProgressTimeline
            stages={progress.map((p: any) => ({
              id: p.stageId,
              name: p.stageName,
              description: p.stageDescription || '',
              status: p.status,
              completedAt: p.completedAt,
              scheduledAt: p.scheduledAt,
            }))}
          />
        )}

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Genel İlerleme</CardTitle>
            <CardDescription>
              {completedStages} / {totalStages} etap tamamlandı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground text-right">
                %{progressPercentage.toFixed(0)} tamamlandı
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Section */}
        {(isEligible || certificate) && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>Tebrikler! Sertifika Kazandınız 🎉</CardTitle>
              </div>
              <CardDescription>
                Tüm etapları başarıyla tamamladınız
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificate ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div>
                      <p className="font-medium">Sertifika Numarası</p>
                      <p className="text-sm text-muted-foreground font-mono">{certificate.certificateNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Düzenlenme: {new Date(certificate.issueDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    {certificate.pdfUrl && (
                      <Button asChild>
                        <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Award className="h-4 w-4 mr-2" />
                          Sertifikayı İndir
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => generateCertificate.mutate()}
                  disabled={generateCertificate.isPending}
                  size="lg"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {generateCertificate.isPending ? "Oluşturuluyor..." : "Sertifikamı Oluştur"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active Stage Card */}
        {activeStage ? (
          <Card className="border-primary shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Aktif Etap</CardTitle>
                    {progress && (
                      <Badge variant="outline" className="text-xs">
                        {(progress.findIndex((s: any) => s.stageId === activeStage.stageId) + 1)}/{progress.length}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2 text-base font-medium text-foreground">
                    {activeStage.stageName}
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-blue-600">Aktif</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {activeStage.stageDescription}
              </p>
              {totalStages > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Genel İlerleme</span>
                    <span>%{progressPercentage.toFixed(0)}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
              <Button onClick={() => setLocation(`/dashboard/student/stage/${activeStage.stageId}`)} className="w-full sm:w-auto">
                Etabı Başlat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Aktif Etap</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Clock}
                title="Aktif Etap Yok"
                description="Şu anda aktif bir etabınız bulunmamaktadır. Bir önceki etabı tamamladıktan sonra 7 gün içinde yeni etap otomatik olarak aktif hale gelecektir."
              />
            </CardContent>
          </Card>
        )}

        {/* All Stages */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Etaplar</CardTitle>
            <CardDescription>Kariyer değerlendirme sürecinizin tüm aşamaları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress?.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : stage.status === 'active' ? (
                      <Clock className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{stage.stageName}</p>
                      <p className="text-sm text-muted-foreground">
                        {stage.stageDescription}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      stage.status === 'completed'
                        ? 'default'
                        : stage.status === 'active'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {stage.status === 'completed'
                      ? 'Tamamlandı'
                      : stage.status === 'active'
                      ? 'Aktif'
                      : 'Kilitli'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kariyer Profili Özeti */}
        {completedStages >= 2 && (
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-lg">Kariyer Profili Özeti</CardTitle>
                </div>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                  {completedStages} etap tamamlandı
                </Badge>
              </div>
              <CardDescription>
                Tüm etap sonuçlarınızı birleştiren kapsamlı kariyer profili analizi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                RIASEC, Big Five Kişilik, Kariyer Değerleri ve Risk Analizi sonuçlarınızı birleştirerek
                bütünsel bir kariyer profili oluşturulur. AI-Proof kariyer önerileri de dahil edilir.
              </p>
              <div className="flex gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setLocation('/dashboard/student/career-profile')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Profilimi Gör
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports */}
        {reports && reports.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Raporlarım</CardTitle>
                  <CardDescription>Tamamlanan etaplarınızın raporları</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setLocation('/dashboard/student/reports')}>
                  Tümünü Gör
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.slice(0, 3).map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {(report as any).stageName || (report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={report.status === 'approved' ? 'default' : report.status === 'rejected' ? 'destructive' : 'secondary'}
                      >
                        {report.status === 'approved' ? 'Onaylandı' : report.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                      </Badge>
                      {report.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => setLocation(`/dashboard/student/reports/${report.id}`)}
                        >
                          Görüntüle
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mentor Contact */}
        {user.mentorId && (
          <Card className="border-indigo-200 bg-indigo-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base">Mentorünüze Ulaşın</CardTitle>
                </div>
              </div>
              <CardDescription>
                Sorularınız için mentorünüze mesaj gönderebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                onClick={() => setChatOpen(true)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Mentor ile Mesajlaş
              </Button>
              <ChatDialog
                open={chatOpen}
                onOpenChange={setChatOpen}
                otherUser={{ id: user.mentorId, name: 'Mentörünüz' }}
                currentUserRole="student"
              />
            </CardContent>
          </Card>
        )}
        {/* Pilot Geri Bildirim Banner */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquareHeart className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Deneyiminizi paylaşın!</p>
                <p className="text-sm text-purple-700">Platformu geliştirmemize yardımcı olun</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
              onClick={() => setLocation("/geri-bildirim")}
            >
              Geri Bildirim Ver
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
