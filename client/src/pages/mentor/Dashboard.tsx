import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, GraduationCap, FileText, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MentorDashboard() {
  const { data: pendingStudents, isLoading: loadingPending, refetch: refetchPending } = 
    trpc.mentor.getPendingStudents.useQuery();
  const { data: myStudents, isLoading: loadingStudents } = 
    trpc.mentor.getMyStudents.useQuery();
  const { data: pendingReports, isLoading: loadingReports } = 
    trpc.mentor.getPendingReports.useQuery();

  const activateStudentMutation = trpc.mentor.activateStudent.useMutation({
    onSuccess: () => {
      toast.success("Étudiant activé avec succès");
      refetchPending();
    },
    onError: () => {
      toast.error("Erreur lors de l'activation");
    },
  });

  const isLoading = loadingPending || loadingStudents || loadingReports;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    pending: pendingStudents?.length || 0,
    active: myStudents?.filter(s => s.status === 'active').length || 0,
    reports: pendingReports?.length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Mentor</h1>
          <p className="text-gray-600">Gérez vos étudiants et leurs progressions</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Étudiants à approuver
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mes étudiants</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Étudiants actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rapports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reports}</div>
              <p className="text-xs text-muted-foreground">
                À approuver
              </p>
            </CardContent>
          </Card>
        </div>

        {pendingStudents && pendingStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Étudiants en attente d'approbation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-xs text-gray-500">
                        Groupe d'âge: {student.ageGroup}
                      </p>
                    </div>
                    <Button
                      onClick={() => activateStudentMutation.mutate({ studentId: student.id })}
                      disabled={activateStudentMutation.isPending}
                    >
                      {activateStudentMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Activer"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Aucune activité récente</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
