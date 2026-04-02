import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  GripVertical,
  Settings2,
  X,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Target,
  Layers,
  FileText,
  PieChart,
} from 'lucide-react';

// Default widget configuration
export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'kpi-cards', label: 'KPI Kartları', visible: true, order: 0 },
  { id: 'daily-registrations', label: 'Günlük Kayıtlar', visible: true, order: 1 },
  { id: 'monthly-revenue', label: 'Aylık Gelir', visible: true, order: 2 },
  { id: 'daily-revenue', label: 'Günlük Gelir', visible: true, order: 3 },
  { id: 'weekly-reg-trend', label: 'Haftalık Kayıt Trendi', visible: true, order: 4 },
  { id: 'stage-completion-trend', label: 'Etap Tamamlama Trendi', visible: true, order: 5 },
  { id: 'age-group-dist', label: 'Yaş Grubu Dağılımı', visible: true, order: 6 },
  { id: 'question-cat-dist', label: 'Değerlendirme Kategorisi', visible: true, order: 7 },
  { id: 'report-stats', label: 'Rapor İstatistikleri', visible: true, order: 8 },
  { id: 'user-activity', label: 'Kullanıcı Aktivite Özeti', visible: true, order: 9 },
  { id: 'package-dist', label: 'Paket Dağılımı', visible: true, order: 10 },
  { id: 'cohort-analysis', label: 'Kohort Analizi', visible: true, order: 11 },
  { id: 'conversion-funnel', label: 'Dönüşüm Hunisi', visible: true, order: 12 },
  { id: 'segmentation', label: 'Kullanıcı Segmentasyonu', visible: true, order: 13 },
];

const WIDGET_ICONS: Record<string, typeof BarChart3> = {
  'kpi-cards': BarChart3,
  'daily-registrations': TrendingUp,
  'monthly-revenue': DollarSign,
  'daily-revenue': DollarSign,
  'weekly-reg-trend': TrendingUp,
  'stage-completion-trend': Activity,
  'age-group-dist': Users,
  'question-cat-dist': Layers,
  'report-stats': FileText,
  'user-activity': Users,
  'package-dist': PieChart,
  'cohort-analysis': Target,
  'conversion-funnel': Target,
  'segmentation': Users,
};

// Sortable widget item
function SortableWidgetItem({
  widget,
  onToggleVisibility,
}: {
  widget: WidgetConfig;
  onToggleVisibility: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = WIDGET_ICONS[widget.id] || BarChart3;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        widget.visible
          ? 'bg-card border-border'
          : 'bg-muted/30 border-dashed border-muted-foreground/30'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Icon className={`h-4 w-4 shrink-0 ${widget.visible ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`flex-1 text-sm font-medium ${!widget.visible ? 'text-muted-foreground line-through' : ''}`}>
        {widget.label}
      </span>
      <div className="flex items-center gap-2">
        {widget.visible ? (
          <Eye className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <Switch
          checked={widget.visible}
          onCheckedChange={() => onToggleVisibility(widget.id)}
          className="scale-90"
        />
      </div>
    </div>
  );
}

interface WidgetCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onWidgetsChange: (widgets: WidgetConfig[]) => void;
}

export function WidgetCustomizer({ isOpen, onClose, widgets, onWidgetsChange }: WidgetCustomizerProps) {
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>(widgets);
  const [hasChanges, setHasChanges] = useState(false);

  const saveMutation = trpc.admin.saveWidgetPreferences.useMutation({
    onSuccess: () => {
      toast.success('Widget düzeni kaydedildi');
      onWidgetsChange(localWidgets);
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Widget düzeni kaydedilemedi');
    },
  });

  useEffect(() => {
    setLocalWidgets(widgets);
    setHasChanges(false);
  }, [widgets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalWidgets(prev => {
      const oldIndex = prev.findIndex(w => w.id === active.id);
      const newIndex = prev.findIndex(w => w.id === over.id);
      const newArr = arrayMove(prev, oldIndex, newIndex).map((w, i) => ({ ...w, order: i }));
      return newArr;
    });
    setHasChanges(true);
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setLocalWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
    setHasChanges(true);
  }, []);

  const handleReset = useCallback(() => {
    setLocalWidgets(DEFAULT_WIDGETS);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    saveMutation.mutate(localWidgets);
  }, [localWidgets, saveMutation]);

  if (!isOpen) return null;

  const visibleCount = localWidgets.filter(w => w.visible).length;
  const hiddenCount = localWidgets.filter(w => !w.visible).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md max-h-[85vh] flex flex-col mx-4">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Dashboard Widget Düzeni
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Widget'ları sürükleyerek sıralayın, görünürlüğü açıp kapatın.
          </p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs text-emerald-600 font-medium">{visibleCount} görünür</span>
            <span className="text-xs text-muted-foreground">{hiddenCount} gizli</span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto pb-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localWidgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {localWidgets.map(widget => (
                  <SortableWidgetItem
                    key={widget.id}
                    widget={widget}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>

        <div className="p-4 border-t flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
            Sıfırla
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onClose}>
            İptal
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
            className="gap-1"
          >
            {saveMutation.isPending ? (
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Kaydet
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default WidgetCustomizer;
