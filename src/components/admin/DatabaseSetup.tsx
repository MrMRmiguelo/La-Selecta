import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { setupDatabase, getDatabaseSetupInstructions } from '@/utils/setupDatabase';
import { useToast } from '@/components/ui/use-toast';

export function DatabaseSetup() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();

  const checkDatabaseStatus = async () => {
    setChecking(true);
    try {
      const result = await setupDatabase();
      setStatus(result);
      
      // Si alguna tabla no existe, mostrar instrucciones
      if (!result.daily_sales.success || !result.daily_totals.success) {
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Error verificando base de datos:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar el estado de la base de datos.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = async (text: string, tableName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: `SQL para ${tableName} copiado al portapapeles.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "Configurada" : "Faltante"}
      </Badge>
    );
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const instructions = getDatabaseSetupInstructions();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Configuración de Base de Datos
        </CardTitle>
        <CardDescription>
          Verifica y configura las tablas necesarias para el funcionamiento del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={checkDatabaseStatus} 
            disabled={checking}
            variant="outline"
          >
            {checking ? "Verificando..." : "Verificar Estado"}
          </Button>
        </div>

        {status && (
          <div className="space-y-3">
            <h4 className="font-medium">Estado de las Tablas:</h4>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.daily_sales.success)}
                  <span className="font-medium">daily_sales</span>
                </div>
                {getStatusBadge(status.daily_sales.success)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.daily_totals.success)}
                  <span className="font-medium">daily_totals</span>
                </div>
                {getStatusBadge(status.daily_totals.success)}
              </div>
            </div>

            {(!status.daily_sales.success || !status.daily_totals.success) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Algunas tablas necesarias no están configuradas. Esto puede causar errores en la facturación y contabilidad.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {showInstructions && (
          <div className="space-y-4 mt-6">
            <h4 className="font-medium text-lg">Instrucciones de Configuración</h4>
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Para configurar las tablas faltantes, ejecuta los siguientes comandos SQL en tu dashboard de Supabase:
                <br />
                <strong>Dashboard → SQL Editor → Nueva consulta</strong>
              </AlertDescription>
            </Alert>

            {!status?.daily_sales.success && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    SQL para tabla daily_sales
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(instructions.daily_sales_sql, 'daily_sales')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {instructions.daily_sales_sql}
                  </pre>
                </CardContent>
              </Card>
            )}

            {!status?.daily_totals.success && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    SQL para tabla daily_totals
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(instructions.daily_totals_sql, 'daily_totals')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {instructions.daily_totals_sql}
                  </pre>
                </CardContent>
              </Card>
            )}

            <Alert>
              <AlertDescription>
                <strong>Pasos:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Ve a tu dashboard de Supabase</li>
                  <li>Navega a "SQL Editor"</li>
                  <li>Crea una nueva consulta</li>
                  <li>Copia y pega el SQL correspondiente</li>
                  <li>Ejecuta la consulta</li>
                  <li>Repite para cada tabla faltante</li>
                  <li>Vuelve aquí y verifica el estado nuevamente</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}