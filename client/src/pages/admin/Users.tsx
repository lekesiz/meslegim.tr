import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/DashboardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminUsers() {
  const { data: users, isLoading, refetch } = trpc.admin.getUsers.useQuery();
  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı başarıyla güncellendi");
      refetch();
    },
    onError: () => {
      toast.error("Güncelleme sırasında bir hata oluştu");
    },
  });

  const [editingUser, setEditingUser] = useState<number | null>(null);

  const handleUpdateRole = (userId: number, role: 'student' | 'mentor' | 'admin') => {
    updateUserMutation.mutate({
      id: userId,
      data: { role },
    });
  };

  const handleUpdateStatus = (userId: number, status: 'pending' | 'active' | 'inactive') => {
    updateUserMutation.mutate({
      id: userId,
      data: { status },
    });
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
      mentor: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
      student: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    };
    return colors[role as keyof typeof colors] || "bg-muted text-foreground";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
      pending: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
      inactive: "bg-muted text-foreground",
    };
    return colors[status as keyof typeof colors] || "bg-muted text-foreground";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">Platformdaki tüm kullanıcıları yönetin</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Listesi ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={8} />
            ) : !users || users.length === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="Kullanıcı Bulunamadı"
                description="Sistemde henüz kayıtlı kullanıcı bulunmuyor."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Yaş Grubu</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {editingUser === user.id ? (
                            <Select
                              defaultValue={user.role}
                              onValueChange={(value) => {
                                handleUpdateRole(user.id, value as 'student' | 'mentor' | 'admin');
                                setEditingUser(null);
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Öğrenci</SelectItem>
                                <SelectItem value="mentor">Mentor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getRoleBadge(user.role)}>
                              {user.role === 'student' ? 'Öğrenci' : user.role === 'mentor' ? 'Mentor' : 'Admin'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(user.status)}>
                            {user.status === 'active' ? 'Aktif' : user.status === 'pending' ? 'Beklemede' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.ageGroup || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user.id)}
                            className="transition-all duration-300 hover:scale-105 active:scale-95"
                          >
                            Düzenle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
