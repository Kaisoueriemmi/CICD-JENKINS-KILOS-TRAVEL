'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur pour le monitoring
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center max-w-2xl">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 shadow-xl">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          500
        </h1>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Une erreur est survenue
        </h2>
        <p className="text-lg text-gray-600 mb-2">
          Désolé, quelque chose s'est mal passé de notre côté.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Notre équipe a été notifiée et travaille sur le problème.
        </p>

        {/* Error Details (en dev seulement) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Réessayer</span>
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
          >
            <Home className="w-5 h-5" />
            <span>Retour au Dashboard</span>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Besoin d'aide ?
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              Si le problème persiste, contactez notre support :
            </p>
            <a
              href="mailto:support@airweight.io"
              className="text-blue-600 hover:text-blue-700 hover:underline block"
            >
              support@airweight.io
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
