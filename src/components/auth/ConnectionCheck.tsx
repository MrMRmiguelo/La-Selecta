import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout, AUTH_TIMEOUT_MS } from "@/utils/authTimeout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Componente que verifica la conexión con Supabase
 * y muestra un mensaje de error si no se puede conectar
 */
export function ConnectionCheck() {
  const [connectionError, setConnectionError] = useState(false);
  const [errorType, setErrorType] = useState<'timeout' | 'server' | 'network' | 'unknown'>('unknown');
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();

  const checkConnection = async () => {
    setChecking(true);
    setConnectionError(false);
    setErrorType('unknown');
    
    try {
      // Verificar la conexión usando el estado de la sesión
      await withTimeout(supabase.auth.getSession());
      setConnectionError(false);
      toast({
        title: "Conexión establecida",
        description: "La conexión con el servidor se ha restablecido correctamente.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error de conexión con Supabase:", error);
      setConnectionError(true);
      
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
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (!connectionError) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <Alert className="max-w-md w-full bg-white dark:bg-gray-900 border-red-500">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <AlertTitle className="text-red-500 text-lg">Error de conexión</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            {errorType === 'timeout' ? (
              <>La operación de autenticación ha excedido el tiempo límite ({AUTH_TIMEOUT_MS/1000} segundos). Esto puede deberse a:</>  
            ) : (
              <>No se pudo conectar con el servidor. Esto puede deberse a:</>
            )}
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            {errorType === 'timeout' && (
              <>
                <li>Conexión a internet lenta o inestable</li>
                <li>El servidor está experimentando alta carga</li>
                <li>Problemas temporales con el servicio de Supabase</li>
              </>
            )}
            {errorType === 'network' && (
              <>
                <li>No hay conexión a internet</li>
                <li>Problemas con tu red WiFi o datos móviles</li>
                <li>Firewall o configuración de red bloqueando la conexión</li>
              </>
            )}
            {errorType === 'server' && (
              <>
                <li>El servidor de Supabase no está disponible</li>
                <li>Mantenimiento programado del servicio</li>
                <li>Problemas técnicos en el lado del servidor</li>
              </>
            )}
            {errorType === 'unknown' && (
              <>
                <li>Problemas con tu conexión a internet</li>
                <li>El servidor de Supabase no está disponible</li>
                <li>La configuración de Supabase no es correcta</li>
              </>
            )}
          </ul>
          <div className="flex justify-end">
            <Button 
              onClick={checkConnection} 
              disabled={checking}
              className="flex items-center gap-2"
            >
              {checking ? "Verificando..." : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Reintentar conexión
                </>
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}