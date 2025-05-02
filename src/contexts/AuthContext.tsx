import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { withTimeout } from '@/utils/authTimeout';

interface UserSession {
  user: User;
  session: Session;
  role?: string;
}

interface AuthContextType {
  currentSession: UserSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getUserRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Inicializar con la sesión actual al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar si hay una sesión activa con timeout
        const { data } = await withTimeout(supabase.auth.getSession());
        
        if (data.session) {
          const userSession: UserSession = {
            user: data.session.user,
            session: data.session
          };
          setCurrentSession(userSession);
        }
      } catch (error) {
        console.error('Error al inicializar la autenticación:', error);
        toast({
          title: 'Error de conexión',
          description: 'No se pudo conectar con el servidor de autenticación. Por favor, intenta de nuevo.',
          variant: 'destructive',
        });
      } finally {
        // Asegurar que siempre se termine el estado de carga
        setLoading(false);
      }
    };

    initializeAuth();

    // Suscribirse a cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const userSession: UserSession = {
            user: session.user,
            session: session
          };
          setCurrentSession(userSession);
        } else if (event === 'SIGNED_OUT') {
          setCurrentSession(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  // Iniciar sesión con Supabase
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Error de autenticación',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      if (data.user && data.session) {
        const userSession: UserSession = {
          user: data.user,
          session: data.session
        };
        setCurrentSession(userSession);
        return { error: null };
      }
      
      return { error: new Error('No se pudo iniciar sesión') };
    } catch (error: any) {
      console.error('Error durante el inicio de sesión:', error);
      toast({
        title: 'Error inesperado',
        description: error.message || 'Ocurrió un error al intentar iniciar sesión',
        variant: 'destructive',
      });
      return { error };
    }
  };

  // Obtener el rol del usuario
  const getUserRole = () => {
    if (!currentSession?.user) return null;
    return currentSession.user.user_metadata?.role || null;
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentSession(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión correctamente',
        variant: 'destructive',
      });
    }
  };

  const value = {
    currentSession,
    loading,
    signIn,
    signOut,
    getUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}