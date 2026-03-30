import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Pencil, Trash2, Building2, Users, GraduationCap, Search } from 'lucide-react';
import { toast } from 'sonner';

export function SchoolManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [assignMentorOpen, setAssignMentorOpen] = useState<number | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');

  const { data: schools, isLoading } = trpc.school.getAll.useQuery({ search: searchQuery || undefined });
  const { data: mentors } = trpc.admin.getUsers.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.school.create.useMutation({
    onSuccess: () => {
      toast.success('Okul başarıyla oluşturuldu');
      utils.school.getAll.invalidate();
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.school.update.useMutation({
    onSuccess: () => {
      toast.success('Okul güncellendi');
      utils.school.getAll.invalidate();
      setEditingSchool(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.school.delete.useMutation({
    onSuccess: () => {
      toast.success('Okul silindi');
      utils.school.getAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const assignMentorMutation = trpc.school.assignMentor.useMutation({
    onSuccess: () => {
      toast.success('Mentor okula atandı');
      utils.school.getAll.invalidate();
      setAssignMentorOpen(null);
      setSelectedMentorId('');
    },
    onError: (e) => toast.error(e.message),
  });

  const mentorList = mentors?.filter((u: any) => u.role === 'mentor') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Okul Yönetimi</h2>
          <p className="text-muted-foreground">Okulları oluşturun, düzenleyin ve mentor atayın</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Okul Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Okul Oluştur</DialogTitle>
              <DialogDescription>Sisteme yeni bir okul ekleyin</DialogDescription>
            </DialogHeader>
            <SchoolForm
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Okul ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Okul</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Okul</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools?.filter((s: any) => s.status === 'active').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools?.reduce((sum: number, s: any) => sum + (s.studentCount || 0), 0) || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* School List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Okul Adı</TableHead>
                <TableHead>Şehir</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Öğrenci</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools && schools.length > 0 ? (
                schools.map((school: any) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.city || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                        {school.status === 'active' ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>{school.studentCount || 0}</TableCell>
                    <TableCell>{school.mentorCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingSchool(school)}
                          title="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAssignMentorOpen(school.id)}
                          title="Mentor Ata"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Bu okulu silmek istediğinize emin misiniz?')) {
                              deleteMutation.mutate({ id: school.id });
                            }
                          }}
                          title="Sil"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Henüz okul bulunmamaktadır.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit School Dialog */}
      {editingSchool && (
        <Dialog open={!!editingSchool} onOpenChange={(open) => !open && setEditingSchool(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Okul Düzenle</DialogTitle>
              <DialogDescription>{editingSchool.name} bilgilerini güncelleyin</DialogDescription>
            </DialogHeader>
            <SchoolForm
              initialData={editingSchool}
              onSubmit={(data) => updateMutation.mutate({ id: editingSchool.id, ...data })}
              isPending={updateMutation.isPending}
              onCancel={() => setEditingSchool(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Mentor Dialog */}
      {assignMentorOpen && (
        <Dialog open={!!assignMentorOpen} onOpenChange={(open) => !open && setAssignMentorOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mentor Ata</DialogTitle>
              <DialogDescription>Bu okula bir mentor atayın</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedMentorId} onValueChange={setSelectedMentorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Mentor seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mentorList.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignMentorOpen(null)}>İptal</Button>
                <Button
                  disabled={!selectedMentorId || assignMentorMutation.isPending}
                  onClick={() => assignMentorMutation.mutate({
                    schoolId: assignMentorOpen,
                    mentorId: parseInt(selectedMentorId),
                  })}
                >
                  {assignMentorMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Ata
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SchoolForm({ initialData, onSubmit, isPending, onCancel }: {
  initialData?: any;
  onSubmit: (data: any) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [status, setStatus] = useState(initialData?.status || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, city, address, phone, email, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="school-name">Okul Adı *</Label>
          <Input id="school-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school-city">Şehir</Label>
          <Input id="school-city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="school-address">Adres</Label>
        <Textarea id="school-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="school-phone">Telefon</Label>
          <Input id="school-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school-email">E-posta</Label>
          <Input id="school-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Durum</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {initialData ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
}
