import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function StageForm() {
  const { data: activeStage, isLoading } = trpc.student.getActiveStage.useQuery();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const saveAnswerMutation = trpc.student.saveAnswer.useMutation({
    onSuccess: () => {
      toast.success("Réponse sauvegardée");
    },
  });

  const submitStageMutation = trpc.student.submitStage.useMutation({
    onSuccess: () => {
      toast.success("Étape soumise avec succès! Un rapport sera généré.");
      window.location.href = "/dashboard/student";
    },
    onError: () => {
      toast.error("Erreur lors de la soumission");
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!activeStage) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Aucune étape active pour le moment.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/dashboard/student"}>
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-save
    saveAnswerMutation.mutate({
      questionId,
      answer: value,
    });
  };

  const handleSubmit = () => {
    // Check if all required questions are answered
    const requiredQuestions = activeStage.questions.filter(q => q.required);
    const unanswered = requiredQuestions.filter(q => !answers[q.id]);
    
    if (unanswered.length > 0) {
      toast.error(`Veuillez répondre à toutes les questions obligatoires (${unanswered.length} restantes)`);
      return;
    }

    submitStageMutation.mutate({
      stageId: activeStage.stageId,
    });
  };

  const renderQuestion = (question: any) => {
    const options = question.options ? JSON.parse(question.options) : [];

    switch (question.type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`q${question.id}-${index}`}
                  checked={answers[question.id]?.includes(option)}
                  onCheckedChange={(checked) => {
                    const current = answers[question.id]?.split(",") || [];
                    const updated = checked
                      ? [...current, option]
                      : current.filter(o => o !== option);
                    handleAnswerChange(question.id, updated.join(","));
                  }}
                />
                <Label htmlFor={`q${question.id}-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "likert":
        return (
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
                <Label htmlFor={`q${question.id}-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "ranking":
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Glissez-déposez pour classer par ordre d'importance (1 = plus important)
            </p>
            <div className="space-y-2">
              {options.map((option: string, index: number) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-white cursor-move hover:bg-gray-50"
                >
                  <span className="font-medium">{index + 1}.</span> {option}
                </div>
              ))}
            </div>
          </div>
        );

      case "text":
        return (
          <Textarea
            placeholder="Votre réponse..."
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
          />
        );

      default:
        return <p>Type de question non supporté</p>;
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = activeStage.questions.length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Étape active</h1>
          <p className="text-gray-600">Complétez le questionnaire ci-dessous</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Questions répondues</span>
                <span className="font-medium">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {activeStage.questions.map((question: any, index: number) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
              <p className="text-gray-700">{question.text}</p>
            </CardHeader>
            <CardContent>
              {renderQuestion(question)}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.location.href = "/dashboard/student"}
          >
            Sauvegarder et continuer plus tard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitStageMutation.isPending}
          >
            {submitStageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Soumettre l'étape
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
