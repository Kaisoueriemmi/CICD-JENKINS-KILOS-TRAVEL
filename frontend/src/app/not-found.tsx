import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page non trouvée
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            <span>Retour au Dashboard</span>
          </Link>
          
          <Link
            href="/"
            className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Page d'accueil</span>
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Pages populaires</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/flights"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Mes Vols
            </Link>
            <Link
              href="/wallet"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Mon Wallet
            </Link>
            <Link
              href="/transactions"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Transactions
            </Link>
            <Link
              href="/profile"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Mon Profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
