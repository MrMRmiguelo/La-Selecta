
import logo from "/public/logo_la_selecta.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { withTimeout } from "@/utils/authTimeout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [errorType, setErrorType] = useState<'timeout' | 'server' | 'network' | 'unknown'>('unknown');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  
  // Verificar si el usuario fue redirigido desde otra página
  useEffect(() => {
    const state = location.state as { from?: Location };
    if (state?.from) {
      toast({
        title: "Sesión requerida",
        description: "Por favor, inicia sesión para continuar.",
        variant: "default",
      });
    }
  }, [location, toast]);

  // Verificar la conexión con Supabase al cargar el componente
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const { success, error } = await checkSupabaseConnection();
        setConnectionError(!success);
        
        if (!success && error) {
          console.error('Error de conexión:', error);
          // Determinar el tipo de error
          if (error.message && error.message.includes("tiempo límite")) {
            setErrorType('timeout');
          } else if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
            setErrorType('network');
          } else if (error.status >= 500) {
            setErrorType('server');
          } else {
            setErrorType('unknown');
          }
        }
      } catch (err) {
        console.error('Error al verificar conexión:', err);
        setConnectionError(true);
        setErrorType('unknown');
      }
    };
    
    verifyConnection();
  }, []);

  const handleRetryConnection = async () => {
    setLoading(true);
    try {
      const { success } = await checkSupabaseConnection();
      setConnectionError(!success);
      if (success) {
        toast({
          title: "Conexión restablecida",
          description: "La conexión con el servidor se ha restablecido correctamente.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error al reintentar conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setConnectionError(false);

    try {
      // Usar el método signIn del AuthContext
      const { error } = await signIn(email, password);

      if (error) {
        // Verificar si es un error de conexión
        if (error.message && error.message.includes("tiempo límite")) {
          setConnectionError(true);
          setErrorType('timeout');
        } else if (error.message && (error.message.includes("network") || error.message.includes("conexión"))) {
          setConnectionError(true);
          setErrorType('network');
        } else {
          toast({
            title: "Error de autenticación",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Redirigir a la página anterior o a la página principal
      const state = location.state as { from?: Location };
      const from = state?.from?.pathname || "/";
      
      toast({ title: "Bienvenido", description: "Has iniciado sesión exitosamente", variant: "default" });
      navigate(from);
    } catch (error: any) {
      console.error('Error durante el inicio de sesión:', error);
      
      // Manejar errores de conexión
      if (error.message && error.message.includes("tiempo límite")) {
        setConnectionError(true);
        setErrorType('timeout');
      } else {
        toast({
          title: "Error inesperado",
          description: "Ocurrió un error al intentar iniciar sesión. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {connectionError ? (
        <AuthErrorDisplay 
          errorType={errorType}
          onRetry={handleRetryConnection}
          isRetrying={loading}
        />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <img src={logo} alt="Delicias La Selecta" className="mx-auto mb-4" />
            <CardTitle>Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Correo de Admin"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Entrando...
                  </>
                ) : "Entrar"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Usa tu correo y contraseña registrados en Supabase como Admin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
