import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackFormProps {
  mentorId: number;
  mentorName: string;
  reportId?: number;
  onSuccess?: () => void;
}

export default function FeedbackForm({ mentorId, mentorName, reportId, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitFeedback = trpc.student.submitFeedback.useMutation({
    onSuccess: () => {
      toast.success('Geri bildiriminiz gönderildi!');
      setRating(0);
      setComment('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Geri bildirim gönderilemedi: ' + error.message);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Lütfen bir puan verin');
      return;
    }

    submitFeedback.mutate({
      mentorId,
      reportId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor Değerlendirmesi</CardTitle>
        <CardDescription>
          {mentorName} hakkındaki deneyiminizi paylaşın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">Puanlama</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 1 && 'Çok kötü'}
              {rating === 2 && 'Kötü'}
              {rating === 3 && 'Orta'}
              {rating === 4 && 'İyi'}
              {rating === 5 && 'Mükemmel'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Yorumunuz (İsteğe bağlı)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Mentorunuz hakkında düşüncelerinizi paylaşın..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/500 karakter
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || submitFeedback.isPending}
          className="w-full"
        >
          {submitFeedback.isPending ? 'Gönderiliyor...' : 'Geri Bildirimi Gönder'}
        </Button>
      </CardContent>
    </Card>
  );
}
