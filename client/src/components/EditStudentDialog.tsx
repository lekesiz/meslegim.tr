import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    ageGroup: string | null;
    status: string;
    mentorId: number | null;
  };
}

export function EditStudentDialog({ open, onOpenChange, student }: EditStudentDialogProps) {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone || '');
  const [ageGroup, setAgeGroup] = useState<string>(student.ageGroup || '');
  const [status, setStatus] = useState<string>(student.status);
  const [mentorId, setMentorId] = useState<string>(student.mentorId?.toString() || 'none');

  const { data: mentors } = trpc.admin.getUsers.useQuery();
  const updateMutation = trpc.admin.updateUser.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone || '');
    setAgeGroup(student.ageGroup || '');
    setStatus(student.status);
    setMentorId(student.mentorId?.toString() || 'none');
  }, [student]);

  const mentorList = mentors?.filter(u => u.role.includes('mentor')) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: student.id,
        data: {
          name,
          email,
          phone: phone || undefined,
          ageGroup: ageGroup as '14-17' | '18-21' | '22-24' | undefined,
          status: status as 'pending' | 'active' | 'inactive',
          mentorId: mentorId && mentorId !== 'none' ? parseInt(mentorId) : undefined,
        },
      });

      toast.success('Öğrenci bilgileri güncellendi');
      utils.admin.getUsers.invalidate();
      onOpenChange(false);
    } catch (error) {
      toast.error('Güncelleme başarısız oldu');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Öğrenci Düzenle</DialogTitle>
          <DialogDescription>
            Öğrenci bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageGroup">Yaş Grubu</Label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Yaş grubu seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14-17">14-17</SelectItem>
                <SelectItem value="18-21">18-21</SelectItem>
                <SelectItem value="22-24">22-24</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Durum</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentor">Mentor</Label>
            <Select value={mentorId} onValueChange={setMentorId}>
              <SelectTrigger>
                <SelectValue placeholder="Mentor seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Mentor atanmadı</SelectItem>
                {mentorList.map((mentor) => (
                  <SelectItem key={mentor.id} value={mentor.id.toString()}>
                    {mentor.name} ({mentor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              İptal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
