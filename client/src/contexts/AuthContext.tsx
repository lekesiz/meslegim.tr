import { createContext, useContext, ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

type User = {
  id: number;
  name: string | null;
  email: string | null;
  role: 'student' | 'mentor' | 'admin';
  status: 'pending' | 'active' | 'inactive';
  ageGroup?: '14-17' | '18-21' | '22-24' | null;
  phone?: string | null;
  tcKimlik?: string | null;
  mentorId?: number | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
