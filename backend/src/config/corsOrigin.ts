import type { CorsOptions } from 'cors';

/**
 * Résout l’origine autorisée pour Express + Socket.io.
 * - `FRONTEND_URLS` : liste séparée par des virgules (prioritaire)
 * - `FRONTEND_URL` : une seule origine
 * - En développement (NODE_ENV !== 'production') : tout `http(s)://localhost` et `127.0.0.1` (tout port)
 * - Sinon : défaut `http://localhost:5173`
 */
export function resolveCorsOrigin(): CorsOptions['origin'] {
  const list = process.env.FRONTEND_URLS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const single = process.env.FRONTEND_URL?.trim();

  if (list && list.length > 0) {
    return list.length === 1 ? list[0]! : list;
  }
  if (single) {
    return single;
  }

  if (process.env.NODE_ENV !== 'production') {
    return (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      try {
        const { hostname, protocol } = new URL(origin);
        const okLocal =
          (hostname === 'localhost' || hostname === '127.0.0.1') &&
          (protocol === 'http:' || protocol === 'https:');
        if (okLocal) {
          callback(null, true);
          return;
        }
      } catch {
        callback(new Error('Origine invalide'));
        return;
      }
      callback(new Error('Non autorisé par CORS'));
    };
  }

  return 'http://localhost:5173';
}
