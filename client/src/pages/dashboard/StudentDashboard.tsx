import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, Clock, CheckCircle2, Lock, Award, MessageCircle, User, MessageSquareHeart, BarChart3, ShoppingCart } from "lucide-react";
import { toast } from 'sonner';
import { ChatDialog } from "@/components/ChatDialog";
import { useState, useEffect } from "react";
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
  const { data: accessData } = trpc.payment.getMyAccess.useQuery();

  // Ödeme başarı bildirimi
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('payment');
    const paymentProduct = searchParams.get('product');
    
    if (paymentStatus === 'success') {
      const productNames: Record<string, string> = {
        basic_package: 'Temel Paket',
        professional_package: 'Profesyonel Paket',
        enterprise_package: 'Kurumsal Paket',
        ai_career_report: 'AI Kariyer Raporu',
        single_stage_unlock: 'Tekli Etap Açma',
      };
      toast.success(`${productNames[paymentProduct || ''] || 'Satın alma'} işleminiz tamamlandı. Etaplarınız güncelleniyor.`, {
        duration: 5000,
      });
      window.history.replaceState({}, '', '/dashboard/student');
    }
  }, []);
  
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--navy)] tracking-tight">Hoş Geldiniz, {user.name}!</h1>
          <p className="text-sm text-[var(--slate-muted)] mt-1.5 font-medium">
            Kariyer değerlendirme ve gelişim sürecinizi buradan takip edebilirsiniz.
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
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[var(--navy)]">Genel Süreç İlerlemesi</h2>
              <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">
                {completedStages} / {totalStages} etap tamamlandı
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[var(--gold-dark)]">%{progressPercentage.toFixed(0)}</span>
            </div>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full">
            <div className="h-full rounded-full progress-bar-gold transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Certificate Section */}
        {(isEligible || certificate) && (
          <div className="border-[var(--gold)]/30 bg-gradient-to-br from-white to-[var(--cream)] shadow-md rounded-2xl p-6 border">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] shadow-sm">
                <Award className="h-6 w-6 text-[var(--navy)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--navy)]">Tebrikler! Başarı Sertifikası Kazandınız</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Tüm etapları başarıyla tamamladınız. Sertifikanızı oluşturup indirebilirsiniz.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100/50">
                  {certificate ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          <p className="text-xs font-bold text-green-700">Sertifika Hazır ve Doğrulanmış</p>
                        </div>
                        <p className="font-mono text-xs text-slate-400">{certificate.certificateNumber}</p>
                        <p className="text-[11px] text-slate-400">
                          Düzenleme Tarihi: {new Date(certificate.issueDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {certificate.pdfUrl && (
                          <a
                            href={certificate.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-accent px-5 py-2.5 text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm no-underline"
                          >
                            <Award className="h-4 w-4 mr-1.5 text-[var(--navy)]" />
                            Sertifikayı İndir
                          </a>
                        )}
                        <button
                          onClick={() => window.open(`/verify-certificate/${certificate.certificateNumber}`, '_blank')}
                          className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold px-4 py-2.5 transition-all text-xs bg-white cursor-pointer"
                        >
                          Doğrula
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <p className="text-xs text-[var(--slate-muted)] text-center font-medium">Profesyonel sertifikanızı oluşturun. Altın çerçeveli, QR doğrulamalı ve RIASEC profilinizi içerir.</p>
                      <button 
                        onClick={() => generateCertificate.mutate()}
                        disabled={generateCertificate.isPending}
                        className="btn-accent px-8 py-3 text-sm font-bold flex items-center justify-center cursor-pointer shadow-md"
                      >
                        {generateCertificate.isPending ? "Oluşturuluyor..." : "Sertifikamı Oluştur"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Stage Card */}
        {activeStage ? (
          <div className="border-[var(--gold)]/30 bg-white rounded-2xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--navy)]">Aktif Etap</h3>
                {progress && (
                  <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500">
                    {(progress.findIndex((s: any) => s.stageId === activeStage.stageId) + 1)} / {progress.length}
                  </Badge>
                )}
              </div>
              <Badge className="bg-[var(--gold)] text-[var(--navy)] border-none font-bold text-xs py-1 px-3.5 rounded-full shadow-xs">Aktif</Badge>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-[var(--navy)] mb-1">{activeStage.stageName}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {activeStage.stageDescription}
                </p>
              </div>
              {totalStages > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>Etap İlerleme</span>
                    <span>%{progressPercentage.toFixed(0)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                    <div className="h-full rounded-full progress-bar-gold transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>
              )}
              <button 
                onClick={() => setLocation(`/dashboard/student/stage/${activeStage.stageId}`)} 
                className="btn-primary w-full sm:w-auto font-bold px-6 py-2.5 text-sm flex items-center justify-center cursor-pointer shadow-md mt-2"
              >
                Etabı Başlat
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[var(--navy)]">Aktif Etap</h3>
            </div>
            <EmptyState
              icon={Clock}
              title="Aktif Etap Yok"
              description="Şu anda aktif bir etabınız bulunmamaktadır. Bir önceki etabı tamamladıktan sonra 7 gün içinde yeni etap otomatik olarak aktif hale gelecektir."
            />
          </div>
        )}

        {/* All Stages */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="pb-3 mb-4 border-b border-slate-50">
            <h3 className="font-bold text-base text-[var(--navy)]">Süreç Aşamaları</h3>
            <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">Kariyer değerlendirme sürecinizin tüm adımları</p>
          </div>
          <div className="space-y-3">
            {progress?.map((stage) => (
              <div
                key={stage.id}
                className="flex items-center justify-between p-4 border border-slate-100/80 rounded-xl hover:border-slate-200 transition-all bg-slate-50/30"
              >
                <div className="flex items-center gap-3">
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : stage.status === 'active' ? (
                    <Clock className="h-5 w-5 text-[var(--steel)] flex-shrink-0 animate-pulse" />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-sm text-[var(--navy)]">{stage.stageName}</p>
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-[200px] sm:max-w-md">
                      {stage.stageDescription}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      stage.status === 'completed'
                        ? 'bg-green-50 text-green-700 border-none font-bold text-[10px]'
                        : stage.status === 'active'
                        ? 'bg-[var(--gold)]/10 text-[var(--gold-dark)] border-none font-bold text-[10px]'
                        : 'bg-slate-100 text-slate-450 border-none font-bold text-[10px]'
                    }
                  >
                    {stage.status === 'completed'
                      ? 'Tamamlandı'
                      : stage.status === 'active'
                      ? 'Aktif'
                      : 'Kilitli'}
                  </Badge>
                  {stage.status === 'locked' && (
                    <button
                      onClick={() => setLocation('/fiyatlandirma')}
                      className="ml-2 border border-[var(--gold)]/30 text-[var(--gold-dark)] hover:bg-[var(--gold)]/10 rounded-lg font-bold px-3 py-1 transition-all text-[10px] flex items-center gap-1 bg-white cursor-pointer"
                    >
                      <ShoppingCart className="h-3 w-3 text-[var(--gold-dark)]" />
                      Aç
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kariyer Profili Özeti */}
        {completedStages >= 2 && (
          <div className="border-[var(--gold)]/20 bg-gradient-to-br from-white to-[var(--cream)] rounded-2xl p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[var(--gold-dark)]" />
                <h3 className="font-bold text-base text-[var(--navy)]">Kariyer Haritam & Kişilik Profilim</h3>
              </div>
              <Badge className="bg-[var(--steel)] text-white border-none font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                {completedStages} etap verisi analiz edildi
              </Badge>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Tamamlamış olduğunuz etaplardan elde edilen RIASEC İlgi Profili, Big Five Kişilik Kriterleri, Değerler Envanteri ve Risk Yönetimi sonuçlarınızı bütünsel olarak görüntüleyebilirsiniz.
              </p>
              <button
                className="btn-primary font-bold px-6 py-2.5 text-sm flex items-center justify-center cursor-pointer shadow-md"
                onClick={() => setLocation('/dashboard/student/career-profile')}
              >
                <BarChart3 className="h-4 w-4 mr-1.5 text-[var(--gold)]" />
                Profilimi Görüntüle
              </button>
            </div>
          </div>
        )}

        {/* Reports */}
        {reports && reports.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="pb-3 mb-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--navy)]">Kariyer Raporlarım</h3>
                <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">Onaylanmış veya değerlendirilen raporlarınız</p>
              </div>
              <button 
                onClick={() => setLocation('/dashboard/student/reports')}
                className="border-2 border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-4 py-2 transition-all text-xs bg-white cursor-pointer"
              >
                Tümünü Gör
              </button>
            </div>
            <div className="space-y-3">
              {reports.slice(0, 3).map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[var(--steel)] flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-[var(--navy)]">
                        {(report as any).stageName || (report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu')}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        report.status === 'approved' 
                          ? 'bg-green-50 text-green-700 border-none font-bold text-[10px]' 
                          : report.status === 'rejected' 
                            ? 'bg-red-50 text-red-700 border-none font-bold text-[10px]' 
                            : 'bg-amber-50 text-amber-700 border-none font-bold text-[10px]'
                      }
                    >
                      {report.status === 'approved' ? 'Onaylandı' : report.status === 'rejected' ? 'Reddedildi' : 'Değerlendirmede'}
                    </Badge>
                    {report.status === 'approved' && (
                      <button
                        onClick={() => setLocation(`/dashboard/student/reports/${report.id}`)}
                        className="bg-[var(--steel)] hover:bg-[var(--steel-light)] text-white font-semibold rounded-lg text-xs px-3.5 py-1.5 cursor-pointer transition-colors shadow-sm"
                      >
                        Görüntüle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentor Contact */}
        {user.mentorId && (
          <div className="border-slate-100 bg-slate-50/50 rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[var(--steel)]" />
                <h3 className="font-bold text-base text-[var(--navy)]">Mentorunuz ile İletişim</h3>
              </div>
            </div>
            <p className="text-xs text-[var(--slate-muted)] font-medium mb-4">
              Değerlendirme sonuçları, gelişim süreçleriniz veya sorularınız için mentorünüze anlık mesaj gönderebilirsiniz.
            </p>
            <button
              className="border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white rounded-xl font-bold px-5 py-2 transition-all text-xs bg-white cursor-pointer flex items-center gap-2"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4 text-[var(--navy)] group-hover:text-white" />
              Mesajlaşmayı Başlat
            </button>
            <ChatDialog
              open={chatOpen}
              onOpenChange={setChatOpen}
              otherUser={{ id: user.mentorId, name: 'Mentörünüz' }}
              currentUserRole="student"
            />
          </div>
        )}

        {/* Pilot Geri Bildirim Banner */}
        <div className="bg-gradient-to-r from-[var(--navy)] to-[var(--steel)] text-white p-6 rounded-2xl shadow-md border-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageSquareHeart className="h-6 w-6 text-[var(--gold)]" />
              <div>
                <p className="font-bold text-white text-base">Kullanıcı deneyiminizi paylaşın!</p>
                <p className="text-xs text-slate-200 font-light mt-0.5">Platformumuzu geliştirmemize yardımcı olun.</p>
              </div>
            </div>
            <button
              className="border-2 border-white/20 text-white hover:bg-white hover:text-[var(--navy)] rounded-xl font-bold px-6 py-2.5 transition-all text-sm bg-transparent cursor-pointer shrink-0"
              onClick={() => setLocation("/geri-bildirim")}
            >
              Geri Bildirim Ver
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
