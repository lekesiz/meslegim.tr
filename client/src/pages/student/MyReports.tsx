import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLocation } from 'wouter';

export default function MyReports() {
  const [, setLocation] = useLocation();
  const { data: reports, isLoading } = trpc.student.getMyReports.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Raporlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Onay Bekliyor</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Raporlarım</h1>
        <p className="text-muted-foreground">
          Tamamladığınız etapların değerlendirme raporlarını buradan görüntüleyebilirsiniz.
        </p>
      </div>

      {!reports || reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz Rapor Yok</h3>
            <p className="text-muted-foreground text-center">
              Etapları tamamladıkça raporlarınız burada görünecektir.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      Etap {report.stageId} Raporu
                    </CardTitle>
                    <CardDescription>
                      Oluşturulma: {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <div>
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocation(`/dashboard/student/reports/${report.id}`)}
                    variant="default"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Raporu Görüntüle
                  </Button>
                  {report.status === 'approved' && (
                    <Button
                      onClick={() => setLocation(`/dashboard/student/reports/${report.id}?download=true`)}
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF İndir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
