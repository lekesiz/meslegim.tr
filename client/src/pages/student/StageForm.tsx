import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { Loader2, Save, Send } from 'lucide-react';
import { toast } from 'sonner';

type Answer = {
  [questionId: number]: string;
};

export default function StageForm() {
  const { stageId } = useParams<{ stageId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Answer>({});
  
  // Debug: answers state değişikliklerini izle
  useEffect(() => {
    console.log('📊 answers state changed:', JSON.stringify(answers, null, 2));
  }, [answers]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: activeStage, isLoading } = trpc.student.getActiveStage.useQuery();
  const saveAnswerMutation = trpc.student.saveAnswer.useMutation({
    onSuccess: () => {
      // Silent success - auto-save feedback
    },
    onError: (error) => {
      toast.error(`Yanıt kaydedilemedi: ${error.message}`);
    },
  });
  const submitStageMutation = trpc.student.submitStage.useMutation({
    onSuccess: () => {
      toast.success('Etap başarıyla tamamlandı! Raporunuz hazırlanıyor.');
      setLocation('/dashboard/student');
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  useEffect(() => {
    if (activeStage?.answers) {
      const initialAnswers: Answer = {};
      activeStage.answers.forEach((ans: any) => {
        initialAnswers[ans.questionId] = ans.answer;
      });
      setAnswers(initialAnswers);
    }
  }, [activeStage]);
  if (!user || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!activeStage || activeStage.stageId !== parseInt(stageId!)) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Etap Bulunamadı</CardTitle>
            <CardDescription>
              Bu etap aktif değil veya erişim yetkiniz bulunmamaktadır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/dashboard/student')}>
              Panele Dön
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const questions = activeStage.questions || [];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const handleAnswerChange = async (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-save
    setIsSaving(true);
    try {
      await saveAnswerMutation.mutateAsync({ questionId, answer: value });
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    const requiredQuestions = questions.filter((q: any) => q.required);
    const unanswered = requiredQuestions.filter((q: any) => !answers[q.id]);

    if (unanswered.length > 0) {
      toast.error(`Lütfen tüm zorunlu soruları cevaplayın (${unanswered.length} soru kaldı)`);
      return;
    }

    submitStageMutation.mutate({
      stageId: activeStage.stageId,
    });
  };

  const renderQuestion = (question: any) => {
    const options = question.options ? JSON.parse(question.options) : [];
    const currentAnswer = String(answers[question.id] || '');

    switch (question.type) {
      case 'text':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Cevabınızı buraya yazın..."
            className="min-h-[100px]"
          />
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            key={`mc-${question.id}-${currentAnswer}`}
            value={currentAnswer}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={String(option)} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'likert':
        const likertOptions = options.length > 0 ? options : ['1', '2', '3', '4', '5'];
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Kesinlikle Katılmıyorum</span>
              <span>Kesinlikle Katılıyorum</span>
            </div>
            <RadioGroup
              key={`likert-${question.id}-${currentAnswer}`}
              value={currentAnswer}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="flex justify-between"
            >
              {likertOptions.map((option: string) => (
                <div key={option} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value={String(option)} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`} className="text-xs">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'ranking':
        // For ranking, we'll use checkboxes with multiple selection
        const selectedOptions = currentAnswer ? currentAnswer.split(',') : [];
        return (
          <div className="space-y-2">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    let newSelected = [...selectedOptions];
                    if (checked) {
                      newSelected.push(option);
                    } else {
                      newSelected = newSelected.filter(o => o !== option);
                    }
                    handleAnswerChange(question.id, newSelected.join(','));
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Cevabınızı buraya yazın..."
          />
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{activeStage.stageName}</h1>
            <p className="text-muted-foreground mt-2">
              {activeStage.stageDescription}
            </p>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Kaydediliyor...</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>İlerleme</CardTitle>
            <CardDescription>
              {answeredCount} / {questions.length} soru cevaplanmış
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4" key={JSON.stringify(Object.keys(answers).sort())}>
          {questions.map((question: any, index: number) => (
            <Card key={`q-${question.id}-${answers[question.id] || 'empty'}-${Object.keys(answers).length}`}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Soru {index + 1}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </CardTitle>
                <CardDescription>{question.text}</CardDescription>
              </CardHeader>
              <CardContent>
                {renderQuestion(question)}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setLocation('/dashboard/student')}
          >
            Panele Dön
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitStageMutation.isPending}
            size="lg"
          >
            {submitStageMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Etabı Tamamla
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
