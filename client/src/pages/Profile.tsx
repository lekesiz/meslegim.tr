import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, User, Lock, Mail, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Panele Dön
        </Button>
        
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Profil Ayarları</h1>
        
        <div className="space-y-6">
          <ProfileInfoCard />
          <ChangePasswordCard />
          <EmailVerificationCard />
        </div>
      </div>
    </div>
  );
}

function ProfileInfoCard() {
  const { data: profile, isLoading } = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setName(profile.name || "");
    setPhone(profile.phone || "");
    setBio(profile.bio || "");
    setInitialized(true);
  }

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profil bilgileriniz güncellendi");
      utils.profile.get.invalidate();
      utils.auth.me.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <Card><CardContent className="p-8 text-center text-muted-foreground">Yükleniyor...</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Kişisel Bilgiler</CardTitle>
        <CardDescription>Adınızı, telefon numaranızı ve biyografinizi güncelleyin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {(profile?.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{profile?.name}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{profile?.role === 'admin' ? 'Yönetici' : profile?.role === 'mentor' ? 'Mentor' : 'Öğrenci'}</Badge>
              {profile?.ageGroup && <Badge variant="secondary">{profile.ageGroup} yaş</Badge>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Hakkımda</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Kendiniz hakkında kısa bir bilgi yazın..." rows={3} maxLength={500} />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
        </div>
        <Button 
          onClick={() => updateMutation.mutate({ name: name || undefined, phone: phone || undefined, bio: bio || undefined })}
          disabled={updateMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {updateMutation.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changeMutation = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Şifreniz başarıyla güncellendi");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır");
      return;
    }
    changeMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Şifre Değiştir</CardTitle>
        <CardDescription>Güvenliğiniz için şifrenizi düzenli olarak değiştirin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mevcut Şifre</Label>
          <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni Şifre</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="En az 6 karakter" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Şifreler eşleşmiyor</p>
        )}
        <Button onClick={handleSubmit} disabled={changeMutation.isPending || !currentPassword || !newPassword} variant="outline">
          {changeMutation.isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </Button>
      </CardContent>
    </Card>
  );
}

function EmailVerificationCard() {
  const { data: profile } = trpc.profile.get.useQuery();
  
  const sendMutation = trpc.profile.sendVerificationEmail.useMutation({
    onSuccess: () => toast.success("Doğrulama e-postası gönderildi! Lütfen e-posta kutunuzu kontrol edin."),
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> E-posta Doğrulama</CardTitle>
        <CardDescription>E-posta adresinizi doğrulayarak hesabınızı güvence altına alın</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm">{profile?.email}</p>
            {profile?.emailVerified ? (
              <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle className="h-3 w-3" /> Doğrulanmış</Badge>
            ) : (
              <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Doğrulanmamış</Badge>
            )}
          </div>
          {!profile?.emailVerified && (
            <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending} variant="outline" size="sm">
              {sendMutation.isPending ? "Gönderiliyor..." : "Doğrulama E-postası Gönder"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
