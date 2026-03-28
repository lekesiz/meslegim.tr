import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowLeft, MessageSquareHeart, Star, CheckCircle } from "lucide-react";
import { analytics } from "@/lib/analytics";

const npsLabels: Record<number, string> = {
  0: "Kesinlikle önermem",
  1: "Önermem",
  2: "Önermem",
  3: "Pek önermem",
  4: "Pek önermem",
  5: "Kararsızım",
  6: "Belki öneririm",
  7: "Muhtemelen öneririm",
  8: "Öneririm",
  9: "Kesinlikle öneririm",
  10: "Kesinlikle öneririm!",
};

export default function PilotFeedback() {
  const [, setLocation] = useLocation();
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [whatWorkedWell, setWhatWorkedWell] = useState("");
  const [whatNeedsImprovement, setWhatNeedsImprovement] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(false);
  const [additionalComments, setAdditionalComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.pilotFeedback.submit.useMutation({
    onSuccess: () => {
      if (npsScore !== null) analytics.feedbackSubmit(npsScore);
      setSubmitted(true);
      toast.success("Geri bildiriminiz için teşekkür ederiz!");
    },
    onError: (err) => toast.error(err.message || "Geri bildirim gönderilemedi"),
  });

  const handleSubmit = () => {
    if (npsScore === null) {
      toast.error("Lütfen bir puan seçin (0-10)");
      return;
    }
    submitMutation.mutate({
      npsScore,
      whatWorkedWell: whatWorkedWell || undefined,
      whatNeedsImprovement: whatNeedsImprovement || undefined,
      wouldRecommend,
      additionalComments: additionalComments || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="py-12 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Teşekkür Ederiz!</h2>
            <p className="text-muted-foreground">
              Geri bildiriminiz bizim için çok değerli. Meslegim.tr'yi daha iyi hale getirmek için kullanacağız.
            </p>
            <Button onClick={() => setLocation("/dashboard")} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
              Dashboard'a Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-2xl py-8">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageSquareHeart className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl">Deneyiminizi Paylaşın</CardTitle>
            <CardDescription>
              Meslegim.tr'yi daha iyi hale getirmemize yardımcı olun. Geri bildiriminiz bizim için çok değerli.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* NPS Skoru */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Meslegim.tr'yi bir arkadaşınıza önerme olasılığınız nedir?
              </Label>
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setNpsScore(i)}
                    className={`w-11 h-11 rounded-lg text-sm font-medium transition-all ${
                      npsScore === i
                        ? i <= 6
                          ? "bg-red-500 text-white scale-110 shadow-lg"
                          : i <= 8
                          ? "bg-yellow-500 text-white scale-110 shadow-lg"
                          : "bg-green-500 text-white scale-110 shadow-lg"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Hiç olası değil</span>
                <span>Çok olası</span>
              </div>
              {npsScore !== null && (
                <p className="text-center text-sm font-medium text-muted-foreground">
                  {npsLabels[npsScore]}
                </p>
              )}
            </div>

            {/* Ne iyi çalıştı? */}
            <div className="space-y-2">
              <Label htmlFor="worked-well" className="text-base font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" /> En çok neyi beğendiniz?
              </Label>
              <Textarea
                id="worked-well"
                value={whatWorkedWell}
                onChange={(e) => setWhatWorkedWell(e.target.value)}
                placeholder="Platformda en çok hoşunuza giden özellikler, tasarım veya deneyimler..."
                rows={3}
                maxLength={1000}
              />
            </div>

            {/* Ne iyileştirilmeli? */}
            <div className="space-y-2">
              <Label htmlFor="needs-improvement" className="text-base font-semibold">
                Neyi iyileştirebiliriz?
              </Label>
              <Textarea
                id="needs-improvement"
                value={whatNeedsImprovement}
                onChange={(e) => setWhatNeedsImprovement(e.target.value)}
                placeholder="Karşılaştığınız sorunlar, eksik bulduğunuz özellikler, önerileriniz..."
                rows={3}
                maxLength={1000}
              />
            </div>

            {/* Arkadaşına önerir misin? */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="recommend"
                checked={wouldRecommend}
                onCheckedChange={(checked) => setWouldRecommend(checked === true)}
              />
              <Label htmlFor="recommend" className="text-sm cursor-pointer">
                Evet, Meslegim.tr'yi arkadaşlarıma ve çevreme öneririm
              </Label>
            </div>

            {/* Ek yorumlar */}
            <div className="space-y-2">
              <Label htmlFor="additional" className="text-base font-semibold">
                Eklemek istediğiniz başka bir şey var mı? (Opsiyonel)
              </Label>
              <Textarea
                id="additional"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Herhangi bir ek yorum, öneri veya düşünce..."
                rows={2}
                maxLength={1000}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={npsScore === null || submitMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-base"
            >
              {submitMutation.isPending ? "Gönderiliyor..." : "Geri Bildirimi Gönder"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Geri bildiriminiz anonim olarak değerlendirilecektir. Kişisel bilgileriniz paylaşılmaz.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
