import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Native HTML radio and checkbox will be used instead of Radix UI
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
          <div className="space-y-3">
            {options.map((option: string, index: number) => (
              <label
                key={index}
                htmlFor={`${question.id}-${index}`}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  id={`${question.id}-${index}`}
                  name={`question-${question.id}`}
                  value={String(option)}
                  checked={currentAnswer === String(option)}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'likert':
        const likertOptions = options.length > 0 ? options : ['1', '2', '3', '4', '5'];
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Kesinlikle Katılmıyorum</span>
              <span>Kesinlikle Katılıyorum</span>
            </div>
            <div className="flex justify-between">
              {likertOptions.map((option: string) => (
                <label
                  key={option}
                  htmlFor={`${question.id}-${option}`}
                  className="flex flex-col items-center space-y-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    id={`${question.id}-${option}`}
                    name={`question-${question.id}`}
                    value={String(option)}
                    checked={currentAnswer === String(option)}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-xs font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'ranking':
        // For ranking, we'll use checkboxes with multiple selection
        const selectedOptions = currentAnswer ? currentAnswer.split(',') : [];
        return (
          <div className="space-y-3">
            {options.map((option: string, index: number) => (
              <label
                key={index}
                htmlFor={`${question.id}-${index}`}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  id={`${question.id}-${index}`}
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => {
                    let newSelected = [...selectedOptions];
                    if (e.target.checked) {
                      newSelected.push(option);
                    } else {
                      newSelected = newSelected.filter(o => o !== option);
                    }
                    handleAnswerChange(question.id, newSelected.join(','));
                  }}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm font-medium">{option}</span>
              </label>
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
