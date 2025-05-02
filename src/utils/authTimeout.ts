/**
 * Utilidad para manejar timeouts en operaciones de autenticación
 * Evita que la aplicación se quede en estado de carga infinita
 */

export const AUTH_TIMEOUT_MS = 30000; // 30 segundos - Aumentado para evitar timeouts en conexiones lentas

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = AUTH_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('La operación de autenticación ha excedido el tiempo límite'));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}