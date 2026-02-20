import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditMentorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
  };
}

export function EditMentorDialog({ open, onOpenChange, mentor }: EditMentorDialogProps) {
  const [name, setName] = useState(mentor.name);
  const [email, setEmail] = useState(mentor.email);
  const [phone, setPhone] = useState(mentor.phone || '');
  const [status, setStatus] = useState<string>(mentor.status);

  const updateMutation = trpc.admin.updateUser.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    setName(mentor.name);
    setEmail(mentor.email);
    setPhone(mentor.phone || '');
    setStatus(mentor.status);
  }, [mentor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: mentor.id,
        data: {
          name,
          email,
          phone: phone || undefined,
          status: status as 'pending' | 'active' | 'inactive',
        },
      });

      toast.success('Mentor bilgileri güncellendi');
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
          <DialogTitle>Mentor Düzenle</DialogTitle>
          <DialogDescription>
            Mentor bilgilerini güncelleyin
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
