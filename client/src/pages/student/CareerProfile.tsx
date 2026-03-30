import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  R: { name: "Gerçekçi", color: "bg-orange-100 text-orange-800 border-orange-200", icon: "🔧" },
  I: { name: "Araştırmacı", color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔬" },
  A: { name: "Sanatsal", color: "bg-purple-100 text-purple-800 border-purple-200", icon: "🎨" },
  S: { name: "Sosyal", color: "bg-green-100 text-green-800 border-green-200", icon: "🤝" },
  E: { name: "Girişimci", color: "bg-red-100 text-red-800 border-red-200", icon: "🚀" },
  C: { name: "Geleneksel", color: "bg-muted text-foreground border-border", icon: "📊" },
};

// Big Five açıklamaları
const bigFiveLabels: Record<string, { name: string; icon: typeof Brain }> = {
  openness: { name: "Deneyime Açıklık", icon: Sparkles },
  conscientiousness: { name: "Sorumluluk", icon: Target },
  extraversion: { name: "Dışa Dönüklük", icon: Zap },
  agreeableness: { name: "Uyumluluk", icon: Heart },
  emotionalStability: { name: "Duygusal Denge", icon: Shield },
};

function ScoreBar({ label, score, color = "bg-primary" }: { label: string; score: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{score}/100</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
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
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/student")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Kariyer Profili Özeti</h1>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/student")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Kariyer Profili Özeti</h1>
              <p className="text-sm text-muted-foreground">
                {completedStageCount} etap, {totalAnswerCount} cevap analiz edildi
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            %{profileCompleteness} Tamamlandı
          </Badge>
        </div>

        {/* Profile Completeness */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Profil Tamamlanma Oranı</span>
                <span className="text-muted-foreground">%{profileCompleteness}</span>
              </div>
              <Progress value={profileCompleteness} className="h-3" />
              <div className="flex gap-2 mt-3">
                <Badge variant={riasec ? "default" : "outline"} className="text-xs">
                  {riasec ? "✓" : "○"} RIASEC & Big Five
                </Badge>
                <Badge variant={values ? "default" : "outline"} className="text-xs">
                  {values ? "✓" : "○"} Kariyer Değerleri
                </Badge>
                <Badge variant={risk ? "default" : "outline"} className="text-xs">
                  {risk ? "✓" : "○"} Risk Analizi
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personality Snapshot */}
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              <CardTitle>Kişilik Profili Özeti</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{integratedInsights.personalitySnapshot}</p>
            {integratedInsights.dominantTraits.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {integratedInsights.dominantTraits.map((trait, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIASEC Profile */}
        {riasec && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle>RIASEC İlgi Profili</CardTitle>
              </div>
              <CardDescription>
                Holland'ın 6 kariyer ilgi alanı modeline göre profiliniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top 3 RIASEC codes */}
              <div className="flex gap-3 mb-4">
                {riasec.riasecTop3.map((code: string, i: number) => {
                  const label = riasecLabels[code];
                  return (
                    <div key={code} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${label?.color || ''}`}>
                      <span className="text-lg">{label?.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{code}</p>
                        <p className="text-xs">{label?.name}</p>
                      </div>
                      {i === 0 && <Badge className="ml-1 text-[10px]">1.</Badge>}
                    </div>
                  );
                })}
              </div>

              {/* Score bars */}
              <div className="space-y-3">
                {Object.entries(riasec.riasec as unknown as Record<string, number>)
                  .sort(([, a], [, b]) => b - a)
                  .map(([code, score]) => (
                    <ScoreBar
                      key={code}
                      label={`${riasecLabels[code]?.icon} ${code} - ${riasecLabels[code]?.name}`}
                      score={score}
                      color={score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-blue-300" : "bg-blue-200"}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Big Five */}
        {riasec && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle>Big Five Kişilik Boyutları</CardTitle>
              </div>
              <CardDescription>
                Beş Faktör Kişilik Modeline göre profiliniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(riasec.bigFive as unknown as Record<string, number>).map(([key, score]) => {
                const label = bigFiveLabels[key];
                const Icon = label?.icon || Brain;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{label?.name || key}</span>
                      </div>
                      <span className="text-muted-foreground">{score}/100</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          score >= 60 ? "bg-purple-500" : score >= 40 ? "bg-purple-300" : "bg-purple-200"
                        }`}
                        style={{ width: `${Math.max(score, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Values Profile */}
        {values && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-600" />
                <CardTitle>Kariyer Değerleri Profili</CardTitle>
              </div>
              <CardDescription>
                Kariyerinizde en çok önem verdiğiniz değerler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top Values */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm">En Önemli Değerleriniz</h4>
                </div>
                <div className="space-y-3">
                  {values.topValues.map((v: any, i: number) => (
                    <div key={v.key} className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-950/30 border border-green-100 dark:border-green-800">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{v.name}</p>
                          <Badge variant="outline" className="text-xs border-green-200 dark:border-green-700 text-green-700 dark:text-green-400">{v.score}/100</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{v.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Values */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-amber-600" />
                  <h4 className="font-semibold text-sm">Daha Az Öncelikli Değerleriniz</h4>
                </div>
                <div className="space-y-2">
                  {values.bottomValues.map((v: any) => (
                    <div key={v.key} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                      <span className="text-sm">{v.name}</span>
                      <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">{v.score}/100</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Profile */}
        {risk && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                <CardTitle>Kariyer Risk Profili</CardTitle>
              </div>
              <CardDescription>
                Kariyer kararlarında risk alma eğiliminiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk Type Badge */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50/50 border border-amber-100">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  risk.riskType === 'risk-taker' ? 'bg-red-100' :
                  risk.riskType === 'balanced' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {risk.riskType === 'risk-taker' ? '🔥' :
                   risk.riskType === 'balanced' ? '⚖️' : '🛡️'}
                </div>
                <div>
                  <p className="font-semibold">{risk.profileResult.title}</p>
                  <p className="text-sm text-muted-foreground">Genel Skor: {risk.overallScore}/100</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed">{risk.description}</p>

              {/* Risk Dimensions */}
              <div className="space-y-3">
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
                      color={score >= 60 ? "bg-amber-500" : score >= 40 ? "bg-amber-300" : "bg-amber-200"}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strengths & Development */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base">Güçlü Yönler</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{integratedInsights.strengthSummary}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base">Gelişim Alanları</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{integratedInsights.developmentSummary}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI-Proof Careers */}
        {integratedInsights.aiProofCareers.length > 0 && (
          <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-blue-50/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-cyan-600" />
                <CardTitle>AI-Proof Kariyer Önerileri</CardTitle>
              </div>
              <CardDescription>
                Profilinize uygun, yapay zekaya dayanıklı kariyer seçenekleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integratedInsights.aiProofCareers.map((career: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-cyan-700">{career.aiProofScore}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{career.career}</p>
                        <Badge variant="outline" className={`text-[10px] ${
                          career.aiProofScore >= 85 ? 'border-green-300 text-green-700' :
                          career.aiProofScore >= 70 ? 'border-blue-300 text-blue-700' :
                          'border-amber-300 text-amber-700'
                        }`}>
                          AI-Proof: {career.aiProofScore}/100
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{career.reason}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Comprehensive Report */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <CardTitle>Kapsamlı Kariyer Raporu</CardTitle>
            </div>
            <CardDescription>
              Tüm analiz sonuçlarınızı birleştiren, AI destekli detaylı kariyer değerlendirme raporu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!reportContent ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Bu rapor; RIASEC profili, Big Five kişilik boyutları, kariyer değerleri ve risk analizi
                  sonuçlarınızı birleştirerek kişiselleştirilmiş kariyer önerileri, güçlü yönler, gelişim
                  alanları ve AI-Proof kariyer alternatifleri sunar.
                </p>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => generateReport.mutate()}
                  disabled={generateReport.isPending}
                  size="lg"
                >
                  {generateReport.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rapor Oluşturuluyor... (15-30 saniye)
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Kapsamlı Rapor Oluştur
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none p-4 bg-background rounded-lg border">
                  <Streamdown>{reportContent}</Streamdown>
                </div>
                {generateReport.data?.fileUrl && (
                  <Button asChild variant="outline">
                    <a href={generateReport.data.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      PDF İndir
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setLocation("/dashboard/student/reports")}
                >
                  Tüm Raporlarıma Git
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => setLocation("/dashboard/student")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Panele Dön
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
