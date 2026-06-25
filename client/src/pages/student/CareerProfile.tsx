import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useLocation } from "wouter";
import {
  BarChart3, ArrowLeft, Shield, Brain, Heart, Target,
  Sparkles, Download, Loader2, TrendingUp, TrendingDown,
  Zap, Award, ChevronRight, Bot
} from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

// RIASEC kod açıklamaları
const riasecLabels: Record<string, { name: string; color: string; icon: string }> = {
  R: { name: "Gerçekçi", color: "bg-orange-50/50 text-orange-850 border-orange-200/55", icon: "🔧" },
  I: { name: "Araştırmacı", color: "bg-blue-50/50 text-blue-850 border-blue-200/55", icon: "🔬" },
  A: { name: "Sanatsal", color: "bg-purple-50/50 text-purple-850 border-purple-200/55", icon: "🎨" },
  S: { name: "Sosyal", color: "bg-green-50/50 text-green-850 border-green-200/55", icon: "🤝" },
  E: { name: "Girişimci", color: "bg-red-50/50 text-red-850 border-red-200/55", icon: "🚀" },
  C: { name: "Geleneksel", color: "bg-slate-50/50 text-slate-800 border-slate-200/55", icon: "📊" },
};

// Big Five açıklamaları
const bigFiveLabels: Record<string, { name: string; icon: typeof Brain }> = {
  openness: { name: "Deneyime Açıklık", icon: Sparkles },
  conscientiousness: { name: "Sorumluluk", icon: Target },
  extraversion: { name: "Dışa Dönüklük", icon: Zap },
  agreeableness: { name: "Uyumluluk", icon: Heart },
  emotionalStability: { name: "Duygusal Denge", icon: Shield },
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const barClass = score >= 60 
    ? "progress-bar-gold" 
    : score >= 40 
      ? "bg-[var(--steel)]" 
      : "bg-[var(--slate-light)]";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-[var(--navy)]">{label}</span>
        <span className="text-[var(--slate-muted)] font-bold">{score}/100</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{ width: `${Math.max(score, 3)}%` }}
        />
      </div>
    </div>
  );
}

export default function CareerProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [reportContent, setReportContent] = useState<string | null>(null);

  const { data: profileSummary, isLoading } = trpc.student.getCareerProfileSummary.useQuery();

  const generateReport = trpc.student.generateCareerProfileReport.useMutation({
    onSuccess: (data) => {
      setReportContent(data.content);
      toast.success("Kapsamlı kariyer profili raporunuz hazır!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!user) return null;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!profileSummary) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/dashboard/student")}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-[var(--navy)]" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--navy)]">Kariyer Profili Özeti</h1>
          </div>
          <EmptyState
            icon={BarChart3}
            title="Henüz Yeterli Veri Yok"
            description="Kariyer profili özeti oluşturabilmek için en az 2 etabı tamamlamanız gerekiyor. Etaplarınızı tamamladıkça profiliniz zenginleşecektir."
          />
        </div>
      </DashboardLayout>
    );
  }

  const { riasec, values, risk, integratedInsights, profileCompleteness, completedStageCount, totalAnswerCount } = profileSummary;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/dashboard/student")}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-[var(--navy)]" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--navy)] tracking-tight">Kariyer Profili Analizi</h1>
              <p className="text-sm text-[var(--slate-muted)] mt-1 font-medium">
                Toplam <span className="font-bold text-[var(--navy)]">{completedStageCount} etap</span> ve {totalAnswerCount} cevap analiz edildi
              </p>
            </div>
          </div>
          <Badge className="bg-[var(--gold)] text-[var(--navy)] border-none font-bold text-xs px-3.5 py-1.5 rounded-full shrink-0 shadow-sm self-start sm:self-center">
            %{profileCompleteness} Tamamlandı
          </Badge>
        </div>

        {/* Profile Completeness */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-[var(--navy)]">Profil Olgunluk Oranı</span>
              <span className="text-[var(--gold-dark)] font-extrabold">%{profileCompleteness}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full">
              <div className="h-full rounded-full progress-bar-gold transition-all duration-500" style={{ width: `${profileCompleteness}%` }} />
            </div>
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-50">
              <Badge className={riasec ? "bg-[var(--steel)] text-white border-none font-semibold text-xs py-1" : "text-xs py-1 text-slate-400 bg-slate-100"}>
                {riasec ? "✓" : "○"} RIASEC & Big Five
              </Badge>
              <Badge className={values ? "bg-[var(--steel)] text-white border-none font-semibold text-xs py-1" : "text-xs py-1 text-slate-400 bg-slate-100"}>
                {values ? "✓" : "○"} Kariyer Değerleri
              </Badge>
              <Badge className={risk ? "bg-[var(--steel)] text-white border-none font-semibold text-xs py-1" : "text-xs py-1 text-slate-400 bg-slate-100"}>
                {risk ? "✓" : "○"} Risk Analizi
              </Badge>
            </div>
          </div>
        </div>

        {/* Personality Snapshot */}
        <div className="border-[var(--gold)]/20 bg-gradient-to-br from-white to-[var(--cream)] rounded-2xl p-6 lg:p-8 shadow-sm border">
          <div className="flex items-center gap-2.5 mb-3">
            <Brain className="h-6 w-6 text-[var(--gold-dark)]" />
            <h2 className="text-lg font-bold text-[var(--navy)]">Kişilik Profili Özeti</h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--slate-text)] font-medium">{integratedInsights.personalitySnapshot}</p>
          {integratedInsights.dominantTraits.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
              {integratedInsights.dominantTraits.map((trait, i) => (
                <Badge key={i} className="bg-white text-[var(--navy)] border border-slate-200 text-xs font-semibold px-3 py-1 rounded-xl shadow-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* RIASEC Profile */}
        {riasec && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <Target className="h-6 w-6 text-[var(--steel)]" />
              <h2 className="text-lg font-bold text-[var(--navy)]">RIASEC İlgi Profili</h2>
            </div>
            <p className="text-xs text-[var(--slate-muted)] font-medium mb-5">
              Holland'ın 6 kariyer ilgi alanı modeline göre baskın eğilimleriniz
            </p>
            <div className="space-y-4">
              {/* Top 3 RIASEC codes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {riasec.riasecTop3.map((code: string, i: number) => {
                  const label = riasecLabels[code];
                  return (
                    <div key={code} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-xs transition-all duration-200 ${label?.color || ''}`}>
                      <span className="text-2xl">{label?.icon}</span>
                      <div>
                        <p className="font-extrabold text-sm text-[var(--navy)]">{code}</p>
                        <p className="text-xs text-slate-555 font-semibold">{label?.name}</p>
                      </div>
                      {i === 0 && <Badge className="ml-auto bg-[var(--gold)] text-[var(--navy)] border-none font-bold text-[10px] py-0.5 px-2">En Baskın</Badge>}
                    </div>
                  );
                })}
              </div>

              {/* Score bars */}
              <div className="space-y-3.5 pt-4 border-t border-slate-50">
                {Object.entries(riasec.riasec as unknown as Record<string, number>)
                  .sort(([, a], [, b]) => b - a)
                  .map(([code, score]) => (
                    <ScoreBar
                      key={code}
                      label={`${riasecLabels[code]?.icon} ${code} - ${riasecLabels[code]?.name}`}
                      score={score}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Big Five */}
        {riasec && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <Brain className="h-6 w-6 text-[var(--steel)]" />
              <h2 className="text-lg font-bold text-[var(--navy)]">Big Five Kişilik Boyutları</h2>
            </div>
            <p className="text-xs text-[var(--slate-muted)] font-medium mb-5">
              Beş Faktör Kişilik Modeline göre karakter haritanız
            </p>
            <div className="space-y-3.5">
              {Object.entries(riasec.bigFive as unknown as Record<string, number>).map(([key, score]) => {
                const label = bigFiveLabels[key];
                return (
                  <ScoreBar
                    key={key}
                    label={label?.name || key}
                    score={score}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Values Profile */}
        {values && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <Heart className="h-6 w-6 text-[var(--gold-dark)]" />
              <h2 className="text-lg font-bold text-[var(--navy)]">Kariyer Değerleri Profili</h2>
            </div>
            <p className="text-xs text-[var(--slate-muted)] font-medium mb-5">
              Kariyerinizde en çok önem verdiğiniz öncelikler ve değer kriterleri
            </p>
            <div className="space-y-6">
              {/* Top Values */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-bold text-sm text-[var(--navy)]">En Önemli Değerleriniz</h4>
                </div>
                <div className="space-y-3">
                  {values.topValues.map((v: any, i: number) => (
                    <div key={v.key} className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100/50 hover:border-[var(--gold)]/20 transition-all">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--gold)]/15 flex items-center justify-center text-sm font-extrabold text-[var(--gold-dark)]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm text-[var(--navy)]">{v.name}</p>
                          <Badge variant="outline" className="text-xs border-[var(--gold)]/30 text-[var(--gold-dark)] bg-white font-bold">{v.score}/100</Badge>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">{v.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Values */}
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 mb-3.5">
                  <TrendingDown className="h-4 w-4 text-amber-600" />
                  <h4 className="font-bold text-sm text-[var(--navy)]">Daha Az Öncelikli Değerleriniz</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {values.bottomValues.map((v: any) => (
                    <div key={v.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/50">
                      <span className="text-sm font-medium text-[var(--navy)]">{v.name}</span>
                      <Badge variant="outline" className="text-xs border-slate-200 text-slate-500 bg-white font-bold">{v.score}/100</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Profile */}
        {risk && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <Shield className="h-6 w-6 text-[var(--steel)]" />
              <h2 className="text-lg font-bold text-[var(--navy)]">Kariyer Risk Profili</h2>
            </div>
            <p className="text-xs text-[var(--slate-muted)] font-medium mb-5">
              Kariyer kararlarında risk alma ve belirsizlik yönetimi eğiliminiz
            </p>
            <div className="space-y-4">
              {/* Risk Type Badge */}
              <div className="flex items-center gap-4 p-5 rounded-xl bg-[var(--gold)]/5 border border-[var(--gold)]/10 shadow-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                  risk.riskType === 'risk-taker' ? 'bg-red-50 text-red-500' :
                  risk.riskType === 'balanced' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                }`}>
                  {risk.riskType === 'risk-taker' ? '🔥' :
                   risk.riskType === 'balanced' ? '⚖️' : '🛡️'}
                </div>
                <div>
                  <p className="font-extrabold text-[var(--navy)]">{risk.profileResult.title}</p>
                  <p className="text-xs text-[var(--slate-muted)] font-semibold mt-0.5">Genel Skor: {risk.overallScore} / 100</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-600 font-medium py-2">{risk.description}</p>

              {/* Risk Dimensions */}
              <div className="space-y-3.5 pt-4 border-t border-slate-50">
                {Object.entries(risk.profile as unknown as Record<string, number>).map(([key, score]) => {
                  const dimensionNames: Record<string, string> = {
                    changeTolerance: "Değişim Toleransı",
                    uncertaintyManagement: "Belirsizlik Yönetimi",
                    entrepreneurialTendency: "Girişimcilik Eğilimi",
                    careerFlexibility: "Kariyer Esnekliği",
                    decisionMakingStyle: "Karar Alma Tarzı",
                  };
                  return (
                    <ScoreBar
                      key={key}
                      label={dimensionNames[key] || key}
                      score={score}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Strengths & Development */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-base font-bold text-[var(--navy)]">Güçlü Yönler</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 font-medium">{integratedInsights.strengthSummary}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-bold text-[var(--navy)]">Gelişim Alanları</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 font-medium">{integratedInsights.developmentSummary}</p>
          </div>
        </div>

        {/* AI-Proof Careers */}
        {integratedInsights.aiProofCareers.length > 0 && (
          <div className="border-[var(--gold)]/20 bg-gradient-to-br from-white to-[var(--cream)] rounded-2xl p-6 lg:p-8 shadow-sm border">
            <div className="flex items-center gap-2.5 mb-2">
              <Bot className="h-6 w-6 text-[var(--navy)]" />
              <h2 className="text-lg font-bold text-[var(--navy)]">AI-Proof Kariyer Önerileri</h2>
            </div>
            <p className="text-xs text-[var(--slate-muted)] font-medium mb-5">
              Kişisel profilinize uygun, yapay zekaya karşı dayanıklılığı yüksek kariyer alternatifleri
            </p>
            <div className="space-y-3.5">
              {integratedInsights.aiProofCareers.map((career: any, i: number) => (
                <div key={i} className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-sm hover:border-[var(--gold)]/20 transition-all">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
                    <span className="text-sm font-extrabold text-[var(--gold-dark)]">{career.aiProofScore}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-[var(--navy)]">{career.career}</p>
                      <Badge variant="outline" className={`text-[10px] font-bold border-none ${
                        career.aiProofScore >= 85 ? 'bg-green-50 text-green-700' :
                        career.aiProofScore >= 70 ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        AI-Proof: {career.aiProofScore}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">{career.reason}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Comprehensive Report */}
        <div className="border-[var(--navy)]/20 bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] text-white p-6 lg:p-8 rounded-2xl shadow-lg border-0">
          <div className="flex items-center gap-2.5 mb-2">
            <Award className="h-6 w-6 text-[var(--gold)] animate-pulse" />
            <h2 className="text-lg font-bold text-white">Kapsamlı AI Kariyer Raporu</h2>
          </div>
          <p className="text-xs text-slate-300 font-medium mb-5">
            Tüm analiz sonuçlarınızı birleştiren, yapay zeka destekli detaylı değerlendirme raporu
          </p>
          <div className="space-y-4">
            {!reportContent ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-200 font-light leading-relaxed">
                  Bu kapsamlı rapor; RIASEC ilgi profiliniz, Big Five karakter boyutlarınız, kariyer değerleri kriterleriniz ve risk analizi
                  sonuçlarınızı birleştirerek size özel kariyer tavsiyeleri, güçlü ve zayıf yön analizleri ve AI-Proof kariyer alternatifleri sunar.
                </p>
                <button
                  className="btn-accent font-bold px-8 py-3 text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
                  onClick={() => generateReport.mutate()}
                  disabled={generateReport.isPending}
                >
                  {generateReport.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-[var(--navy)]" />
                      Rapor Hazırlanıyor... (15-30 sn)
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Kariyer Raporu Oluştur
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-[var(--slate-text)]">
                <div className="prose prose-sm max-w-none p-5 bg-white rounded-xl border border-white/10 shadow-inner">
                  <Streamdown>{reportContent}</Streamdown>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {generateReport.data?.fileUrl && (
                    <button className="btn-accent px-6 py-2.5 font-bold text-xs flex items-center justify-center cursor-pointer">
                      <Download className="h-4 w-4 mr-1.5" /> PDF Raporunu İndir
                    </button>
                  )}
                  <button
                    onClick={() => setLocation("/dashboard/student/reports")}
                    className="border-2 border-white/20 text-white hover:bg-white hover:text-[var(--navy)] rounded-xl font-bold px-6 py-2.5 transition-all text-xs flex items-center gap-1.5 bg-transparent cursor-pointer"
                  >
                    Tüm Raporlarım
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setLocation("/dashboard/student")}
            className="border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-bold px-6 py-2.5 transition-all text-sm flex items-center gap-1.5 bg-white cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Panele Dön
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
