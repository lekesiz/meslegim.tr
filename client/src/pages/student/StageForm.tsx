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
import { CardSkeleton } from '@/components/DashboardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [answersLoaded, setAnswersLoaded] = useState(false);
  const prevAnswersRef = useRef<string>('');

  const { data: activeStage, isLoading } = trpc.student.getActiveStage.useQuery();
  type ActiveStage = NonNullable<typeof activeStage>;
  type StageQuestion = ActiveStage['questions'][number];
  type StageAnswer = ActiveStage['answers'][number];

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

  // Load initial answers from server - use stable fingerprint to detect changes
  useEffect(() => {
    if (activeStage?.answers && activeStage.answers.length > 0) {
      // Create a fingerprint of server answers to detect real changes
      const fingerprint = activeStage.answers
        .map((ans: StageAnswer) => `${ans.questionId}:${ans.answer}`)
        .sort()
        .join('|');
      
      // Only update if server answers actually changed (prevents overwriting user edits)
      if (fingerprint !== prevAnswersRef.current) {
        prevAnswersRef.current = fingerprint;
        const initialAnswers: Answer = {};
        activeStage.answers.forEach((ans: StageAnswer) => {
          // Normalize: trim whitespace and ensure string type
          initialAnswers[ans.questionId] = String(ans.answer || '').trim();
        });
        setAnswers(initialAnswers);
        setAnswersLoaded(true);
      }
    } else if (activeStage && !answersLoaded) {
      // Stage loaded but no answers yet - mark as loaded so UI renders correctly
      setAnswersLoaded(true);
    }
  }, [activeStage, answersLoaded]);

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="bg-slate-100 p-8 rounded-2xl h-36 animate-pulse" />
          {/* Progress Skeleton */}
          <div className="bg-slate-100 h-24 rounded-2xl animate-pulse" />
          {/* Questions Skeleton */}
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
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
    const requiredQuestions = questions.filter((q: StageQuestion) => q.required);
    const unanswered = requiredQuestions.filter((q: StageQuestion) => !answers[q.id]?.trim());

    if (unanswered.length > 0) {
      toast.error(`Lütfen tüm zorunlu soruları cevaplayın (${unanswered.length} soru kaldı)`);
      return;
    }

    submitStageMutation.mutate({
      stageId: activeStage.stageId,
    });
  };

  const renderQuestion = (question: StageQuestion) => {
    const options = question.options 
      ? (typeof question.options === 'string' 
          ? JSON.parse(question.options) 
          : (Array.isArray(question.options) ? question.options : []))
      : [];
    const currentAnswer = String(answers[question.id] || '').trim();
    
    // Check if this multiple_choice question allows multiple selections
    const metadata = question.metadata 
      ? (typeof question.metadata === 'string' 
          ? JSON.parse(question.metadata) 
          : (typeof question.metadata === 'object' ? question.metadata : {})) as Record<string, any>
      : {};
    const allowMultiple = metadata?.allowMultiple === true;

    switch (question.type) {
      case 'text':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            placeholder="Cevabınızı buraya yazın..."
            className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50/50 p-4 transition-all focus:border-[var(--gold)] focus:ring-[var(--gold)]/20 text-[var(--slate-text)]"
          />
        );

      case 'multiple_choice':
        if (allowMultiple) {
          // Multi-select mode: checkboxes
          const selectedOptions = currentAnswer ? currentAnswer.split(',').filter(Boolean) : [];
          return (
            <div className="space-y-3">
              <Badge variant="outline" className="mb-2 text-xs border-[var(--gold)]/30 text-[var(--gold-dark)] bg-[var(--gold)]/5">
                Birden fazla seçenek işaretleyebilirsiniz
              </Badge>
              {options.map((option: string, index: number) => {
                const optionStr = String(option).trim();
                const isSelected = selectedOptions.includes(optionStr);
                const optionLetter = String.fromCharCode(65 + index);
                return (
                  <label
                    key={index}
                    htmlFor={`mc-${question.id}-${index}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-[var(--gold)] bg-[var(--gold)]/5 shadow-md ring-1 ring-[var(--gold)]/20'
                        : 'border-slate-100 bg-slate-50/30 hover:border-[var(--gold)]/40 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`mc-${question.id}-${index}`}
                      checked={isSelected}
                      onChange={() => {
                        let newSelected: string[];
                        if (isSelected) {
                          newSelected = selectedOptions.filter(o => o !== optionStr);
                        } else {
                          newSelected = [...selectedOptions, optionStr];
                        }
                        handleSelectionChange(question.id, newSelected.join(','));
                      }}
                      className="sr-only"
                    />
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                      isSelected
                        ? 'bg-[var(--gold)] text-[var(--navy)] font-extrabold shadow-sm'
                        : 'bg-slate-100 text-slate-500 font-bold'
                    }`}>
                      {isSelected ? <CheckCircle2 className="h-5 w-5" /> : optionLetter}
                    </span>
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-[var(--navy)] font-semibold' : 'text-[var(--slate-text)]'
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
              const optionStr = String(option).trim();
              const isSelected = currentAnswer === optionStr;
              const optionLetter = String.fromCharCode(65 + index);
              return (
                <label
                  key={index}
                  htmlFor={`mc-${question.id}-${index}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-[var(--gold)] bg-[var(--gold)]/5 shadow-md ring-1 ring-[var(--gold)]/20'
                      : 'border-slate-100 bg-slate-50/30 hover:border-[var(--gold)]/40 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    id={`mc-${question.id}-${index}`}
                    name={`question-${question.id}`}
                    value={optionStr}
                    checked={isSelected}
                    onChange={(e) => handleSelectionChange(question.id, e.target.value.trim())}
                    className="sr-only"
                  />
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected
                      ? 'bg-[var(--gold)] text-[var(--navy)] font-extrabold shadow-sm'
                      : 'bg-slate-100 text-slate-500 font-bold'
                  }`}>
                    {optionLetter}
                  </span>
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-[var(--navy)] font-semibold' : 'text-[var(--slate-text)]'
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
          '1': 'border-red-200 bg-red-50/30 text-red-700 hover:border-red-400',
          '2': 'border-orange-200 bg-orange-50/30 text-orange-700 hover:border-orange-400',
          '3': 'border-slate-200 bg-slate-50/30 text-slate-650 hover:border-slate-400',
          '4': 'border-green-200 bg-green-50/30 text-green-700 hover:border-green-400',
          '5': 'border-emerald-200 bg-emerald-50/30 text-emerald-700 hover:border-emerald-400',
        };
        const selectedLikertColors: Record<string, string> = {
          '1': 'border-red-500 bg-red-100/50 ring-2 ring-red-500/20 text-red-900 font-bold shadow-sm',
          '2': 'border-orange-500 bg-orange-100/50 ring-2 ring-orange-500/20 text-orange-900 font-bold shadow-sm',
          '3': 'border-slate-500 bg-slate-200 ring-2 ring-slate-500/20 text-slate-900 font-bold shadow-sm',
          '4': 'border-green-500 bg-green-100/50 ring-2 ring-green-500/20 text-green-900 font-bold shadow-sm',
          '5': 'border-emerald-500 bg-emerald-100/50 ring-2 ring-emerald-500/20 text-emerald-900 font-bold shadow-sm',
        };

        // Use custom labels from metadata if available
        const customLabels = metadata?.labels || {};
        
        const likertOptions = options.length > 0 ? options : ['1', '2', '3', '4', '5'];
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {likertOptions.map((option: string, idx: number) => {
                const optionKey = String(idx + 1);
                const optionStr = String(option).trim();
                const isSelected = currentAnswer === optionStr;
                return (
                  <label
                    key={optionStr}
                    htmlFor={`likert-${question.id}-${optionStr}`}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <input
                      type="radio"
                      id={`likert-${question.id}-${optionStr}`}
                      name={`question-${question.id}`}
                      value={optionStr}
                      checked={isSelected}
                      onChange={(e) => handleSelectionChange(question.id, e.target.value.trim())}
                      className="sr-only"
                    />
                    <div className={`w-full py-4 px-2 rounded-xl border-2 text-center transition-all ${
                      isSelected 
                        ? (selectedLikertColors[optionKey] || 'border-[var(--gold)] bg-[var(--gold)]/10 ring-2 ring-[var(--gold)]/20')
                        : (likertColors[optionKey] || 'border-slate-100 bg-slate-50/30')
                    }`}>
                      <div className="text-lg font-bold">{optionKey}</div>
                      <div className="text-[10px] leading-tight mt-1.5 whitespace-pre-line font-medium">
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
            <Badge variant="outline" className="mb-2 text-xs border-[var(--gold)]/30 text-[var(--gold-dark)] bg-[var(--gold)]/5">
              Birden fazla seçenek işaretleyebilirsiniz - önem sırasına göre seçin
            </Badge>
            {options.map((option: string, index: number) => {
              const optionStr = String(option).trim();
              const isSelected = selectedRankingOptions.includes(optionStr);
              const selectionOrder = selectedRankingOptions.indexOf(optionStr) + 1;
              return (
                <label
                  key={index}
                  htmlFor={`rank-${question.id}-${index}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-[var(--gold)] bg-[var(--gold)]/5 shadow-md ring-1 ring-[var(--gold)]/20'
                      : 'border-slate-100 bg-slate-50/30 hover:border-[var(--gold)]/40 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`rank-${question.id}-${index}`}
                    checked={isSelected}
                    onChange={() => {
                      let newSelected: string[];
                      if (isSelected) {
                        newSelected = selectedRankingOptions.filter(o => o !== optionStr);
                      } else {
                        newSelected = [...selectedRankingOptions, optionStr];
                      }
                      handleSelectionChange(question.id, newSelected.join(','));
                    }}
                    className="sr-only"
                  />
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected
                      ? 'bg-[var(--navy)] text-[var(--gold)] font-extrabold shadow-sm'
                      : 'bg-slate-100 text-slate-500 font-bold'
                  }`}>
                    {isSelected ? selectionOrder : index + 1}
                  </span>
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-[var(--navy)] font-semibold' : 'text-[var(--slate-text)]'
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
            className="rounded-xl border-slate-200 bg-slate-50/50 p-4 transition-all focus:border-[var(--gold)] focus:ring-[var(--gold)]/20 text-[var(--slate-text)]"
          />
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--navy)] to-[var(--steel)] text-white p-6 md:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{activeStage.stageName}</h1>
            <p className="text-slate-200 mt-2 text-sm md:text-base max-w-xl font-light">
              {activeStage.stageDescription}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-100 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md shrink-0 self-start md:self-center border border-white/10">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[var(--gold-light)]" />
                <span className="font-medium">Değişiklikler kaydediliyor...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-[var(--gold-light)]" />
                <span className="text-[var(--gold-light)] font-semibold">Tüm değişiklikler kaydedildi</span>
              </>
            ) : (
              <span className="opacity-70 text-xs">Cevaplarınız otomatik olarak kaydedilir.</span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[var(--navy)]">Etap İlerleme Durumu</h2>
              <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">
                {answeredCount} / {questions.length} soru tamamlandı
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[var(--gold-dark)]">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full">
            <div className="h-full rounded-full progress-bar-gold transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question: StageQuestion, index: number) => (
            <div key={`q-${question.id}`} className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[var(--gold-dark)] bg-[var(--gold)]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Soru {index + 1}</span>
                  {question.required && <Badge className="bg-red-50 text-red-600 border border-red-250 text-[10px] py-0 px-2">Zorunlu</Badge>}
                </div>
                <h3 className="text-base md:text-lg font-bold text-[var(--navy)] leading-snug">{question.text}</h3>
              </div>
              <div className="pt-2 border-t border-slate-50">
                {renderQuestion(question)}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-150">
          <button
            onClick={() => setLocation('/dashboard/student')}
            className="border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white rounded-xl font-bold px-6 py-2.5 transition-all text-sm flex items-center gap-1.5 bg-white cursor-pointer"
          >
            Panele Dön
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitStageMutation.isPending}
            className="btn-accent px-8 py-3 text-sm font-bold flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitStageMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[var(--navy)]" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Etabı Tamamla ve Gönder
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
