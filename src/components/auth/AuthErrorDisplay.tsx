import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Clock, Wifi, Server } from 'lucide-react';
import { AUTH_TIMEOUT_MS } from '@/utils/authTimeout';

interface AuthErrorDisplayProps {
  errorType: 'timeout' | 'server' | 'network' | 'unknown';
  onRetry: () => void;
  isRetrying: boolean;
}

export function AuthErrorDisplay({ errorType, onRetry, isRetrying }: AuthErrorDisplayProps) {
  return (
    <Card className="w-full max-w-md mx-auto border-red-200 shadow-lg">
      <CardHeader className="bg-red-50 border-b border-red-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-700">Error de conexión</CardTitle>
        </div>
        <CardDescription className="text-red-600">
          {errorType === 'timeout' ? 
            'La operación de autenticación ha excedido el tiempo límite' : 
            'No se pudo conectar con el servidor'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4 mb-4">
          {errorType === 'timeout' && <Clock className="h-8 w-8 text-amber-500 flex-shrink-0" />}
          {errorType === 'network' && <Wifi className="h-8 w-8 text-amber-500 flex-shrink-0" />}
          {errorType === 'server' && <Server className="h-8 w-8 text-amber-500 flex-shrink-0" />}
          {errorType === 'unknown' && <AlertCircle className="h-8 w-8 text-amber-500 flex-shrink-0" />}
          
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              {errorType === 'timeout' && `Tiempo de espera excedido (${AUTH_TIMEOUT_MS/1000}s)`}
              {errorType === 'network' && 'Problema de conexión a internet'}
              {errorType === 'server' && 'El servidor no está disponible'}
              {errorType === 'unknown' && 'Error desconocido'}
            </h3>
            <p className="text-gray-600 text-sm">
              {errorType === 'timeout' && 'La conexión con el servidor está tardando demasiado tiempo. Esto puede deberse a una conexión lenta o problemas en el servidor.'}
              {errorType === 'network' && 'No se pudo establecer conexión con el servidor. Verifica tu conexión a internet.'}
              {errorType === 'server' && 'El servidor de Supabase no está respondiendo. Puede estar en mantenimiento o experimentando problemas técnicos.'}
              {errorType === 'unknown' && 'Ha ocurrido un error inesperado al intentar conectar con el servidor.'}
            </p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-800">
          <p className="font-medium mb-2">Posibles soluciones:</p>
          <ul className="list-disc pl-5 space-y-1">
            {errorType === 'timeout' && (
              <>
                <li>Verifica que tu conexión a internet sea estable</li>
                <li>Intenta nuevamente en unos momentos</li>
                <li>Si el problema persiste, contacta al administrador</li>
              </>
            )}
            {errorType === 'network' && (
              <>
                <li>Comprueba tu conexión WiFi o datos móviles</li>
                <li>Verifica que no haya restricciones de red o firewall</li>
                <li>Intenta conectarte a otra red</li>
              </>
            )}
            {errorType === 'server' && (
              <>
                <li>Espera unos minutos e intenta nuevamente</li>
                <li>Verifica si hay mantenimiento programado</li>
                <li>Contacta al administrador del sistema</li>
              </>
            )}
            {errorType === 'unknown' && (
              <>
                <li>Recarga la página e intenta nuevamente</li>
                <li>Borra la caché del navegador</li>
                <li>Contacta al soporte técnico si el problema persiste</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end bg-gray-50 border-t">
        <Button 
          onClick={onRetry} 
          disabled={isRetrying}
          className="flex items-center gap-2"
        >
          {isRetrying ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Reintentar conexión
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}