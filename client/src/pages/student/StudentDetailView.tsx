import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Loader2, ArrowLeft, FileText, CheckCircle, Clock, TrendingUp, StickyNote, Plus, Edit, Trash2, MessageCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { ChatDialog } from '@/components/ChatDialog';

// Initiate Stages Button Component
function InitiateStagesButton({ studentId, onSuccess }: { studentId: number; onSuccess: () => void }) {
  const initiateMutation = trpc.mentor.initiateStudentStages.useMutation({
    onSuccess: () => {
      toast.success('Öğrenci etapları başarıyla başlatıldı');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Etaplar başlatılırken hata oluştu: ' + error.message);
    },
  });

  return (
    <Button
      onClick={() => initiateMutation.mutate({ studentId })}
      disabled={initiateMutation.isPending}
    >
      {initiateMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Başlatılıyor...
        </>
      ) : (
        'Öğrenci Etaplarını Başlat'
      )}
    </Button>
  );
}

export default function StudentDetailView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data, isLoading } = trpc.mentor.getStudentDetails.useQuery(
    { studentId: parseInt(id || '0') },
    { enabled: !!id }
  );

  const student = data?.student;
  const stages = data?.stages;
  const reports = data?.reports;
  const progress = data?.progress;
  
  // Mentor notes state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{ id: number; note: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // Chat state
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  
  // Fetch mentor notes
  const { data: notes, refetch: refetchNotes } = trpc.mentor.getNotesByStudent.useQuery(
    { studentId: parseInt(id || '0') },
    { enabled: !!id }
  );
  
  const createNoteMutation = trpc.mentor.createNote.useMutation({
    onSuccess: () => {
      toast.success('Not başarıyla eklendi');
      setNoteDialogOpen(false);
      setNoteText('');
      refetchNotes();
    },
    onError: (error) => {
      toast.error('Not eklenirken hata oluştu: ' + error.message);
    },
  });
  
  const updateNoteMutation = trpc.mentor.updateNote.useMutation({
    onSuccess: () => {
      toast.success('Not başarıyla güncellendi');
      setNoteDialogOpen(false);
      setEditingNote(null);
      setNoteText('');
      refetchNotes();
    },
    onError: (error) => {
      toast.error('Not güncellenirken hata oluştu: ' + error.message);
    },
  });
  
  const deleteNoteMutation = trpc.mentor.deleteNote.useMutation({
    onSuccess: () => {
      toast.success('Not başarıyla silindi');
      refetchNotes();
    },
    onError: (error) => {
      toast.error('Not silinirken hata oluştu: ' + error.message);
    },
  });
  
  const handleSaveNote = () => {
    if (!noteText.trim()) {
      toast.error('Not boş olamaz');
      return;
    }
    
    if (editingNote) {
      updateNoteMutation.mutate({ noteId: editingNote.id, note: noteText });
    } else {
      createNoteMutation.mutate({ studentId: parseInt(id || '0'), note: noteText });
    }
  };
  
  const handleEditNote = (note: any) => {
    setEditingNote({ id: note.id, note: note.note });
    setNoteText(note.note);
    setNoteDialogOpen(true);
  };
  
  const handleDeleteNote = (noteId: number) => {
    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      deleteNoteMutation.mutate({ noteId });
    }
  };
  
  const handleCloseDialog = () => {
    setNoteDialogOpen(false);
    setEditingNote(null);
    setNoteText('');
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setLocation('/dashboard/mentor')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Öğrenci bulunamadı.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setLocation('/dashboard/mentor')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>

        {/* Student Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <CardDescription className="mt-2">{student.email}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatDialogOpen(true)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Mesaj Gönder
                </Button>
                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                  {student.status === 'active' ? 'Aktif' : student.status === 'pending' ? 'Beklemede' : 'İnaktif'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                <p className="text-base">{student.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yaş Grubu</p>
                <p className="text-base">{student.ageGroup || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">TC Kimlik</p>
                <p className="text-base">{student.tcKimlik || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kayıt Tarihi</p>
                <p className="text-base">
                  {new Date(student.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {progress && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>İlerleme Durumu</CardTitle>
              </div>
              <CardDescription>
                Öğrencinin genel ilerleme yüzdesi ve tamamlanan etaplar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Genel İlerleme</span>
                    <span className="text-2xl font-bold text-primary">
                      {progress.progressPercentage}%
                    </span>
                  </div>
                  <Progress value={progress.progressPercentage} className="h-3" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-muted-foreground">Tamamlanan</p>
                    <p className="text-2xl font-bold text-green-600">{progress.completedStages}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-muted-foreground">Toplam Etap</p>
                    <p className="text-2xl font-bold">{progress.totalStages}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-muted-foreground">Kalan</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {progress.totalStages - progress.completedStages}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stages Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Etap İlerlemesi</CardTitle>
                <CardDescription>Öğrencinin tamamladığı ve devam eden etaplar</CardDescription>
              </div>
              {stages && stages.length === 0 && (
                <InitiateStagesButton studentId={parseInt(id || '0')} onSuccess={() => window.location.reload()} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {stages && stages.length > 0 ? (
              <div className="space-y-4">
                {stages.map((stage: any) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {stage.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : stage.status === 'in_progress' ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="font-medium">{stage.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stage.status === 'completed'
                            ? 'Tamamlandı'
                            : stage.status === 'in_progress'
                            ? 'Devam Ediyor'
                            : 'Başlanmadı'}
                        </p>
                      </div>
                    </div>
                    {stage.status === 'completed' && stage.completedAt && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(stage.completedAt).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Henüz etap bulunmamaktadır.</p>
            )}
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Raporlar</CardTitle>
            <CardDescription>Öğrencinin oluşturulmuş raporları</CardDescription>
          </CardHeader>
          <CardContent>
            {reports && reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                        {report.status === 'approved' ? 'Onaylandı' : 'Beklemede'}
                      </Badge>
                      {report.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          Görüntüle
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Henüz rapor bulunmamaktadır.</p>
            )}
          </CardContent>
        </Card>

        {/* Mentor Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary" />
                <CardTitle>Mentor Notları</CardTitle>
              </div>
              <Dialog open={noteDialogOpen} onOpenChange={(open) => {
                if (!open) handleCloseDialog();
                else setNoteDialogOpen(true);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Not Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingNote ? 'Notu Düzenle' : 'Yeni Not Ekle'}</DialogTitle>
                    <DialogDescription>
                      {student?.name} hakkında özel notlarınızı ekleyin.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Notunuzu buraya yazın..."
                    rows={5}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      İptal
                    </Button>
                    <Button 
                      onClick={handleSaveNote}
                      disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                    >
                      {createNoteMutation.isPending || updateNoteMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        'Kaydet'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>Öğrenci hakkında özel notlar ve gözlemler</CardDescription>
          </CardHeader>
          <CardContent>
            {notes && notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note: any) => (
                  <div
                    key={note.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deleteNoteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-base whitespace-pre-wrap">{note.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Henüz not bulunmamaktadır.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Chat Dialog */}
      {student && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          otherUser={{ id: student.id, name: student.name }}
          currentUserRole={user.role}
        />
      )}
    </DashboardLayout>
  );
}
