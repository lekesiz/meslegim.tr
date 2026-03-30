import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
      toast.success("Utilisateur mis à jour");
      refetch();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const [editingUser, setEditingUser] = useState<number | null>(null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const handleUpdateRole = (userId: number, role: string) => {
    updateUserMutation.mutate({
      id: userId,
      data: { role: role as any },
    });
  };

  const handleUpdateStatus = (userId: number, status: string) => {
    updateUserMutation.mutate({
      id: userId,
      data: { status: status as any },
    });
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      mentor: "bg-blue-100 text-blue-800",
      student: "bg-green-100 text-green-800",
    };
    return colors[role as keyof typeof colors] || "bg-muted text-foreground";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      inactive: "bg-muted text-foreground",
    };
    return colors[status as keyof typeof colors] || "bg-muted text-foreground";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">Gérer tous les utilisateurs de la plateforme</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Groupe d'âge</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {editingUser === user.id ? (
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => {
                            handleUpdateRole(user.id, value);
                            setEditingUser(null);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Étudiant</SelectItem>
                            <SelectItem value="mentor">Mentor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.ageGroup || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user.id)}
                      >
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
