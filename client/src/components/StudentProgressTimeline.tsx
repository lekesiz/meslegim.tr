import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Lock } from 'lucide-react';

interface Stage {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  completedAt?: string;
  scheduledAt?: string;
}

interface StudentProgressTimelineProps {
  stages: Stage[];
}

export default function StudentProgressTimeline({ stages }: StudentProgressTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Etap İlerlemesi</CardTitle>
        <CardDescription>Tüm etaplarınızın durumu ve timeline görünümü</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-8">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Timeline Items */}
          {stages.map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';
            const isLocked = stage.status === 'locked';

            return (
              <div key={stage.id} className="relative flex gap-6">
                {/* Timeline Dot */}
                <div className="relative z-10 flex items-center justify-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-4 ${
                      isCompleted
                        ? 'border-green-500 bg-green-100'
                        : isActive
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-gray-300 bg-gray-100'
                    }`}
                  >
                    {isCompleted && <CheckCircle className="h-6 w-6 text-green-600" />}
                    {isActive && <Clock className="h-6 w-6 text-blue-600" />}
                    {isLocked && <Lock className="h-6 w-6 text-gray-400" />}
                  </div>
                </div>

                {/* Stage Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{stage.name}</h3>
                    <Badge
                      variant={isCompleted ? 'default' : isActive ? 'secondary' : 'outline'}
                      className={
                        isCompleted
                          ? 'bg-green-500'
                          : isActive
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }
                    >
                      {isCompleted ? 'Tamamlandı' : isActive ? 'Aktif' : 'Kilitli'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{stage.description}</p>
                  {isCompleted && stage.completedAt && (
                    <p className="text-xs text-green-600">
                      Tamamlanma: {new Date(stage.completedAt).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                  {isLocked && stage.scheduledAt && (
                    <p className="text-xs text-gray-500">
                      Planlanan: {new Date(stage.scheduledAt).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
