import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Loader2, Save, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics';

type Answer = {
  [questionId: number]: string;
};

// Debounce hook for text inputs
function useDebounce(callback: (questionId: number, value: string) => void, delay: number) {
  const timerRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const debouncedFn = useCallback((questionId: number, value: string) => {
    if (timerRef.current[questionId]) {
      clearTimeout(timerRef.current[questionId]);
    }
    timerRef.current[questionId] = setTimeout(() => {
      callback(questionId, value);
      delete timerRef.current[questionId];
    }, delay);
  }, [callback, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timerRef.current).forEach(clearTimeout);
    };
  }, []);

  return debouncedFn;
}

export default function StageForm() {
  const { stageId } = useParams<{ stageId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Answer>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const initialLoadDone = useRef(false);

  const { data: activeStage, isLoading } = trpc.student.getActiveStage.useQuery();
  const utils = trpc.useUtils();
  
  const saveAnswerMutation = trpc.student.saveAnswer.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      // DO NOT invalidate here - this was causing the focus loss bug
      // The local state is the source of truth during form editing
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
      if (error.message.includes('UNAUTHORIZED') || error.message.includes('Unauthorized') || error.message.includes('session')) {
        toast.error('Oturumunuz sonlandı. Lütfen tekrar giriş yapın.');
        setTimeout(() => {
          setLocation('/login');
        }, 2000);
      } else {
        toast.error(`Yanıt kaydedilemedi: ${error.message}`);
      }
    },
    retry: 2,
  });

  const submitStageMutation = trpc.student.submitStage.useMutation({
    onSuccess: () => {
      analytics.stageComplete(Number(stageId), activeStage?.stageName || '');
      toast.success('Etap başarıyla tamamlandı! Raporunuz hazırlanıyor.');
      // Invalidate only on submit, not during editing
      utils.student.getActiveStage.invalidate();
      setLocation('/dashboard/student');
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Load initial answers from server - only once
  useEffect(() => {
    if (activeStage?.answers && !initialLoadDone.current) {
      const initialAnswers: Answer = {};
      activeStage.answers.forEach((ans: any) => {
        initialAnswers[ans.questionId] = ans.answer;
      });
      setAnswers(initialAnswers);
      initialLoadDone.current = true;
    }
  }, [activeStage]);

  // Save to server (called by debounce for text, immediately for selections)
  const saveToServer = useCallback(async (questionId: number, value: string) => {
    setIsSaving(true);
    try {
      await saveAnswerMutation.mutateAsync({ questionId, answer: value });
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [saveAnswerMutation]);

  // Debounced save for text inputs (800ms delay)
  const debouncedSave = useDebounce(saveToServer, 800);

  // Handle text input changes - update local state immediately, debounce API call
  const handleTextChange = useCallback((questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    debouncedSave(questionId, value);
  }, [debouncedSave]);

  // Handle selection changes - update local state and save immediately
  const handleSelectionChange = useCallback(async (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    await saveToServer(questionId, value);
  }, [saveToServer]);

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
  const answeredCount = Object.keys(answers).filter(k => answers[Number(k)]?.trim()).length;
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const handleSubmit = () => {
    const requiredQuestions = questions.filter((q: any) => q.required);
    const unanswered = requiredQuestions.filter((q: any) => !answers[q.id]?.trim());

    if (unanswered.length > 0) {
      toast.error(`Lütfen tüm zorunlu soruları cevaplayın (${unanswered.length} soru kaldı)`);
      return;
    }

    submitStageMutation.mutate({
      stageId: activeStage.stageId,
    });
  };

  const renderQuestion = (question: any) => {
    const options = question.options 
      ? (Array.isArray(question.options) ? question.options : JSON.parse(question.options))
      : [];
    const currentAnswer = String(answers[question.id] || '');
    
    // Check if this multiple_choice question allows multiple selections
    const metadata = question.metadata 
      ? (typeof question.metadata === 'object' ? question.metadata : JSON.parse(question.metadata))
      : {};
    const allowMultiple = metadata?.allowMultiple === true;

    switch (question.type) {
      case 'text':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            placeholder="Cevabınızı buraya yazın..."
            className="min-h-[100px]"
          />
        );

      case 'multiple_choice':
        if (allowMultiple) {
          // Multi-select mode: checkboxes
          const selectedOptions = currentAnswer ? currentAnswer.split(',').filter(Boolean) : [];
          return (
            <div className="space-y-3">
              <Badge variant="outline" className="mb-2 text-xs">
                Birden fazla seçenek işaretleyebilirsiniz
              </Badge>
              {options.map((option: string, index: number) => {
                const isSelected = selectedOptions.includes(String(option));
                const optionLetter = String.fromCharCode(65 + index);
                return (
                  <label
                    key={index}
                    htmlFor={`mc-${question.id}-${index}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40 hover:bg-accent/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`mc-${question.id}-${index}`}
                      checked={isSelected}
                      onChange={() => {
                        let newSelected: string[];
                        if (isSelected) {
                          newSelected = selectedOptions.filter(o => o !== String(option));
                        } else {
                          newSelected = [...selectedOptions, String(option)];
                        }
                        handleSelectionChange(question.id, newSelected.join(','));
                      }}
                      className="sr-only"
                    />
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isSelected ? <CheckCircle2 className="h-5 w-5" /> : optionLetter}
                    </span>
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{option}</span>
                  </label>
                );
              })}
            </div>
          );
        }
        
        // Single-select mode: radio buttons
        return (
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const isSelected = currentAnswer === String(option);
              const optionLetter = String.fromCharCode(65 + index);
              return (
                <label
                  key={index}
                  htmlFor={`mc-${question.id}-${index}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/40 hover:bg-accent/50'
                  }`}
                >
                  <input
                    type="radio"
                    id={`mc-${question.id}-${index}`}
                    name={`question-${question.id}`}
                    value={String(option)}
                    checked={isSelected}
                    onChange={(e) => handleSelectionChange(question.id, e.target.value)}
                    className="sr-only"
                  />
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {optionLetter}
                  </span>
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  }`}>{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'likert': {
        const likertLabels: Record<string, string> = {
          '1': 'Kesinlikle\nKatılmıyorum',
          '2': 'Katılmıyorum',
          '3': 'Kararsızım',
          '4': 'Katılıyorum',
          '5': 'Kesinlikle\nKatılıyorum',
        };
        const likertColors: Record<string, string> = {
          '1': 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
          '2': 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
          '3': 'border-gray-300 dark:border-gray-600 bg-muted/50 text-foreground/80',
          '4': 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400',
          '5': 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
        };
        const selectedLikertColors: Record<string, string> = {
          '1': 'border-red-500 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500 text-red-800 dark:text-red-300',
          '2': 'border-orange-500 bg-orange-100 dark:bg-orange-900/40 ring-2 ring-orange-500 text-orange-800 dark:text-orange-300',
          '3': 'border-gray-500 bg-muted ring-2 ring-gray-500 text-foreground',
          '4': 'border-green-500 bg-green-100 dark:bg-green-900/40 ring-2 ring-green-500 text-green-800 dark:text-green-300',
          '5': 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 ring-2 ring-emerald-500 text-emerald-800 dark:text-emerald-300',
        };

        // Use custom labels from metadata if available
        const customLabels = metadata?.labels || {};
        
        const likertOptions = options.length > 0 ? options : ['1', '2', '3', '4', '5'];
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {likertOptions.map((option: string, idx: number) => {
                const optionKey = String(idx + 1);
                const isSelected = currentAnswer === String(option);
                return (
                  <label
                    key={option}
                    htmlFor={`likert-${question.id}-${option}`}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <input
                      type="radio"
                      id={`likert-${question.id}-${option}`}
                      name={`question-${question.id}`}
                      value={String(option)}
                      checked={isSelected}
                      onChange={(e) => handleSelectionChange(question.id, e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-full py-3 px-1 rounded-lg border-2 text-center transition-all ${
                      isSelected 
                        ? (selectedLikertColors[optionKey] || 'border-primary bg-primary/10 ring-2 ring-primary')
                        : (likertColors[optionKey] || 'border-gray-300 bg-muted/50')
                    }`}>
                      <div className="text-lg font-bold">{optionKey}</div>
                      <div className="text-[10px] leading-tight mt-1 whitespace-pre-line">
                        {customLabels[optionKey] || likertLabels[optionKey] || option}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      }

      case 'ranking': {
        // For ranking, use checkboxes with multiple selection
        const selectedRankingOptions = currentAnswer ? currentAnswer.split(',').filter(Boolean) : [];
        return (
          <div className="space-y-3">
            <Badge variant="outline" className="mb-2 text-xs">
              Birden fazla seçenek işaretleyebilirsiniz - önem sırasına göre seçin
            </Badge>
            {options.map((option: string, index: number) => {
              const isSelected = selectedRankingOptions.includes(option);
              const selectionOrder = selectedRankingOptions.indexOf(option) + 1;
              return (
                <label
                  key={index}
                  htmlFor={`rank-${question.id}-${index}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/40 hover:bg-accent/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`rank-${question.id}-${index}`}
                    checked={isSelected}
                    onChange={() => {
                      let newSelected: string[];
                      if (isSelected) {
                        newSelected = selectedRankingOptions.filter(o => o !== option);
                      } else {
                        newSelected = [...selectedRankingOptions, option];
                      }
                      handleSelectionChange(question.id, newSelected.join(','));
                    }}
                    className="sr-only"
                  />
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isSelected ? selectionOrder : index + 1}
                  </span>
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  }`}>{option}</span>
                </label>
              );
            })}
          </div>
        );
      }

      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Kaydedildi</span>
              </>
            ) : null}
          </div>
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

        {/* Questions - STABLE KEYS: only use question.id */}
        <div className="space-y-4">
          {questions.map((question: any, index: number) => (
            <Card key={`q-${question.id}`}>
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
